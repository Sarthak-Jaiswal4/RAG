import React, { useState, useEffect, Suspense, useMemo } from 'react'
import { messagetype } from '@/types/messagetype'
import { formvalues } from '@/types/formvalues'
import axios from 'axios'
import AiResponse from './AiResponse'
import ChatSkeleton from './ChatSkeleton'
import { useSession } from 'next-auth/react'
import SignUpPopup from './SignUp'
import { init } from '@/lib/Producer'
import { useStore } from '@/store/store'

interface props {
    className?:string,
    query:formvalues,
    firstchat?:any
}

const upload = async (role: string, content: string,sessionname:string): Promise<void>  => {
  try {
    const response = await axios.post('/api/updatemessageandmemory', {
      role,
      content,
      sessionname,
    });

    if (response.data.status===404) {
      console.error(response.data.response)
      throw new Error('Failed to update message and memory');
    }
    if (response.data.status===200) {
      console.log('message uploaded successfully')
    }
    return
  } catch (error) {
    console.error('Error uploading message and memory:', error);
    throw error;
  }
}

const handleform = async (payload: any,setIsSearching:React.Dispatch<React.SetStateAction<boolean>>,setMessage:React.Dispatch<React.SetStateAction<messagetype[]>>,setSourcelist:React.Dispatch<React.SetStateAction<Array<string>>>) => {
  console.log('form submitted',payload);
  try {
    const res = await fetch(`/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const reader = res.body?.getReader()
    if (!reader) {
      const data = await res.json()
      const aiResponse = data.response
      const sourcelist = data.SourceList
      if(sourcelist){
        setSourcelist(sourcelist)
      }
      if(aiResponse==undefined || aiResponse==null){
        setMessage(e => [...e,{role:"AI", content:"Something went wrong!"}]);
        setIsSearching(false);
        return aiResponse
      }
      setMessage(e => [...e,{role:"AI", content:aiResponse, sourceList:sourcelist}]);
      setIsSearching(false);
      return {aiResponse,sourcelist};
    }

    const decoder=new TextDecoder()
    let content = ""
    let aiMessageInitialized = false
    setIsSearching(false)
    while(true){
      const {done, value} = await reader.read()
      if(done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split("\n")

      for (const line of lines){
        if(line.startsWith("data: ")){
          try {
            const data = JSON.parse(line.slice(6))
            content += typeof data === 'string' ? data : (data?.text ?? '')
          } catch {
            continue
          }

          if (!aiMessageInitialized) {
            setMessage(e => [...e, { role: "AI", content }])
            aiMessageInitialized = true
          } else {
            setMessage(prev => {
              const arr = [...prev]
              const last = arr.length - 1
              if (last >= 0 && arr[last].role === 'AI') {
                arr[last] = { ...arr[last], content }
              } else {
                arr.push({ role: 'AI', content })
              }
              return arr
            })
          }
        }
      }
    }
    return content
  } catch (err) {
    console.log("error in searching query API call",err);
    setIsSearching(false);
    return null;
  }
};

const searchOrweb=async(payload: formvalues,setIsSearching:React.Dispatch<React.SetStateAction<boolean>>,setState:React.Dispatch<React.SetStateAction<string>>,setisweb:React.Dispatch<React.SetStateAction<boolean>>)=>{
  setIsSearching(true)
  try {
    const response = await axios.post(`/api/chatorweb`,payload)
    const confidence = response.data.response.confidence
    const decision = response.data.response.decision
    const type= response.data.type
    const data = {
      ...payload,confidence,decision,type
    }
    setState(response.data.state)
    if(response.data.state==="SEARCH"){
      setisweb(true)
    }else{
      setisweb(false)
    }
    return data
  } catch (err) {
    console.log("error in searching wheather to search or chat API call",err)
    setIsSearching(false)
    throw new Error(err as string)
  }
}

const GetMsg=async(sessionname:string)=>{
  try {
    const messages=await axios.post('/api/getMessages',{ chatsessionid: sessionname })
    if(messages.data.response.status>=300){
      throw new Error("Something went wrong while retrieving data from API")
    }
    return messages
  } catch (error:any) {
    console.log("Error in getting message from API")
    throw new Error(error)
  }
}

const RagSearch=async(query:string,activepdfs:string[],setMessage:React.Dispatch<React.SetStateAction<messagetype[]>>,setSourcelist:React.Dispatch<React.SetStateAction<Array<string>>>,setIsSearching:React.Dispatch<React.SetStateAction<boolean>>)=>{
  try {
    const search= await axios.post('/api/ragSearch',{
      query,PDFs:activepdfs
    })
      const aiResponse = search.data.answer;
      const sourcelist= search.data.SourceList
      if(aiResponse==undefined || aiResponse==null){
        setMessage(e => [...e,{role:"AI", content:"Something went wrong!"}]);
        return aiResponse
      }
      if(sourcelist){
        setSourcelist(sourcelist)
      }
      if(search.data.status==200){
        setMessage(e => [...e,{role:"AI", content:aiResponse, sourceList:sourcelist}]);
        setIsSearching(false);
        return { aiResponse,sourcelist}
      }
    
  } catch (error) {
    console.log("Error in RagSearch function",error)
    setIsSearching(false);
  }
}
 
function Chat({className,query,firstchat}:props) {
  const [isweb, setisweb] = useState(false)
  const [State, setState] = useState("Analysing")
  const [isSearching, setIsSearching] = useState(false)
  const [message, setMessage] = useState<messagetype[]>([])
  const firstChatProcessed = React.useRef(false)
  const [isMounted, setIsMounted] = useState(false)
  const [Sourcelist, setSourcelist] = useState<Array<string>>([])
  const sessionname=firstchat.sessionname
  const [Signuppopup, setSignuppopup] = useState(false)
  const {data:session,status}=useSession()
  const pdfs=useStore((state)=> state.pdfs)
  const activepdfs=pdfs.filter(pdf => pdf.selected==true).map(pdf => pdf.name)
  const authorized=useMemo(() => status==='authenticated' , [status])

  useEffect(() => {
    
    const processFirstChat = async () => {
      firstChatProcessed.current = true
      console.log("firstchat message",firstchat)
      // Add human message to chat
      try {
        setMessage(e => [...e, {role:"human",content:firstchat.query}])

        let shouldsearch
        if(firstchat.typeofmodel=="RAG"){
          setIsSearching(true)
          setState("Searching in Documents")
          setisweb(false)
          const Ragsearch= await RagSearch(firstchat.query,activepdfs,setMessage,setSourcelist,setIsSearching)
          if(Ragsearch.aiResponse){
            await upload("AI",Ragsearch.aiResponse,sessionname)
          }
        }
        else if(firstchat.type=="Web Search" && firstchat.typeofmodel=="LLM"){
          setisweb(true)
          setState("Searching web")
          shouldsearch={
            ...firstchat,confidence:10,decision:"SEARCH"
          }
          console.log('Regular query search:', shouldsearch)
          const answer=await handleform(shouldsearch, setIsSearching, setMessage,setSourcelist)
          if(answer){
            await upload("AI",answer,sessionname)
          }
        }else{
          shouldsearch = await searchOrweb(firstchat, setIsSearching,setState,setisweb)
          console.log('Regular query LLM:', shouldsearch)
          //search query
          const answer=await handleform(shouldsearch, setIsSearching, setMessage,setSourcelist)
          if(answer){
            await upload("AI",answer,sessionname)
          }
        }
      } catch (error) {
        console.error('Error processing first chat:', error)
        setIsSearching(false)
      }
    }

    const Storetemp=async()=>{
      try {
        console.log(firstchat)
        setMessage(e => [...e, {role:"human",content:firstchat.query}])
        let shouldsearch
        if(firstchat.type=="Web Search"){
          setisweb(true)
          setState("Searching web")
          shouldsearch={
            ...firstchat,confidence:10,decision:"SEARCH"
          }
          console.log('Regular query search:', shouldsearch)
          const answer=await handleform(shouldsearch, setIsSearching, setMessage,setSourcelist)
        }else{
          shouldsearch = await searchOrweb(firstchat, setIsSearching,setState,setisweb)
          console.log('Regular query LLM:', shouldsearch)
          //search query
          const answer=await handleform(shouldsearch, setIsSearching, setMessage,setSourcelist)
        }
      } catch (error:any) {
        console.log('Error in storing temp data',error)
        setIsSearching(false)
      }
    }

    if(firstchat?.query && !firstChatProcessed.current && sessionname!="temp") {
      processFirstChat()
    }else if(firstchat?.query && !firstChatProcessed.current && sessionname=='temp'){
      Storetemp()
    }
  }, [firstchat])

  useEffect(() => {
    const processQuery = async () => {
      //update the human message in chat
      try {
        setMessage(e => [...e, {role:"human",content:query.query}])
        //should search or think
        await upload("human",query.query,sessionname)
        let shouldsearch
        if(query.typeofmodel=="RAG"){
          setIsSearching(true)
          setState("Searching in Documents")
          setisweb(false)
          const Ragsearch= await RagSearch(query.query,activepdfs,setMessage,setSourcelist,setIsSearching)
          if(Ragsearch.aiResponse){
            await upload("AI",Ragsearch.aiResponse,sessionname)
          }
        }
        else if(query.type=="Web Search" && query.typeofmodel=="LLM"){
          setisweb(true)
          setState("Searching web")
          shouldsearch={
            ...query,confidence:10,decision:"SEARCH"
          }
          console.log('Regular query search:', shouldsearch)
          const answer=await handleform(shouldsearch, setIsSearching, setMessage,setSourcelist)
          console.log(answer)
          if(answer){
            await upload("AI",answer,sessionname)
          }
        }else{
          console.log("search")
          shouldsearch = await searchOrweb(query, setIsSearching,setState,setisweb)
          console.log('Regular query LLM:', shouldsearch)
          //search query
          const answer=await handleform(shouldsearch, setIsSearching, setMessage,setSourcelist)
          console.log(answer)
          if(answer){
            await upload("AI",answer,sessionname)
          }
        }
      } catch (error) {
        console.error('Error processing query:', error)
        setIsSearching(false)
      }
    }

    const Storetemp=async()=>{
      try {
        console.log(query)
        setMessage(e => [...e, {role:"human",content:query.query}])
        let shouldsearch

        if(query.type=="Web Search"){
          setisweb(true)
          setState("Searching web")
          shouldsearch={
            ...query,confidence:10,decision:"SEARCH"
          }
          console.log('Regular query search:', shouldsearch)
          const answer=await handleform(shouldsearch, setIsSearching, setMessage,setSourcelist)
        }else{
          shouldsearch = await searchOrweb(query, setIsSearching,setState,setisweb)
          console.log('Regular query LLM:', shouldsearch)
          //search query
          const answer=await handleform(shouldsearch, setIsSearching, setMessage,setSourcelist)
        }
      } catch (error:any) {
        console.log('Error in storing temp data',error)
        setIsSearching(false)
      }
    }

    if(query.query && query.query !== firstchat?.query && sessionname!="temp") {
      processQuery()
    }else if(query.query && query.query !== firstchat?.query && sessionname=='temp'){
      console.log('Running temp')
      Storetemp()
    }
  }, [query.query, firstchat?.query])

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await GetMsg(sessionname);
        setMessage(response.data.response.messages);
        window.scrollTo(0,document.body.scrollHeight)
      } catch (error) {
        console.error(error);
      }
    };
    if(status=='authenticated'){
      fetchMessages();
    }
  }, [authorized])

  useEffect(() => {
    window.scrollTo({left:0, top:document.body.scrollHeight,behavior:'smooth'});
  }, [message]);

  useEffect(() => {
    setIsMounted(true);
    if(status=="unauthenticated"){
      setSignuppopup(true)
    }
  }, [status]);

  if (isMounted === false) {
    return <ChatSkeleton />
  }

  return (
    <>
    <div className={`${className} relative`}>
      <div
        className='md:w-[80%] w-full max-w-196 h-full mx-auto flex flex-col gap-6 items-center pb-24'>
            {
              message?.length>0 ?
              message?.map((item, i) => (
                <div key={i} className={`w-[98%] flex rounded-3xl ${item.role == "AI" ? 'justify-start' : 'justify-end'}`}>
                  <h1 className={` ${item.role == "AI" ? 'justify-start w-[97%]' : 'bg-[#292929] max-w-[80%]'} py-3 px-3 rounded-3xl relative`}>{item.role=='AI' ?  <AiResponse State={isweb} sources={item.sourceList}  content={item.content}/> :item.content}</h1>
                </div>
              ))
              :
              <ChatSkeleton />
            }
        {isSearching && (
          <div className="w-[90%] flex rounded-3xl justify-start">
            <div className="justify-start w-[97%] py-3 px-4 rounded-3xl bg-[#292929]">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-gray-400">{State}...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    {Signuppopup && <SignUpPopup
      window={setSignuppopup}
    />}
    </>
  )
}

export default Chat