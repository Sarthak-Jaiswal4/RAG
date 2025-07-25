import React, { useState, useEffect } from 'react'
import { Separator } from './ui/separator'
import { messagetype } from '@/types/messagetype'
import { formvalues } from '@/types/formvalues'
import axios from 'axios'
import { shoudldosearch } from '@/helper/action'
import AiResponse from './AiResponse'

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
      sessionname
    });

    if (response.data.status===404) {
      console.error(response.data.response)
      throw new Error('Failed to update message and memory');
    }
    if (response.data.status===200) {
      console.log('message uploaded successfully')
    }
  } catch (error) {
    console.error('Error uploading message and memory:', error);
    throw error;
  }
}

const handleform = async (payload: any,setIsSearching:React.Dispatch<React.SetStateAction<boolean>>,setMessage:React.Dispatch<React.SetStateAction<messagetype[]>>) => {
  console.log('form submitted',payload);
  try {
    const response = await axios.post(`/api/search`,payload);
    const aiResponse = response.data.response;
    console.log(aiResponse)
    if(aiResponse==undefined || aiResponse==null){
      setMessage(e => [...e,{role:"AI", content:"Something went wrong!"}]);
      setIsSearching(false);
      return aiResponse
    }
    setMessage(e => [...e,{role:"AI", content:aiResponse}]);
    setIsSearching(false);
    return aiResponse;``
  } catch (err) {
    console.log("error in searching query API call",err);
    setIsSearching(false);
    return null;
  }
};

const searchOrweb=async(payload: formvalues,setIsSearching:React.Dispatch<React.SetStateAction<boolean>>,setState:React.Dispatch<React.SetStateAction<string>>)=>{
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
 
function Chat({className,query,firstchat}:props) {
  const [State, setState] = useState("Analysing")
  const [isSearching, setIsSearching] = useState(false)
  const [message, setMessage] = useState<messagetype[]>([])
  const firstChatProcessed = React.useRef(false)
  const sessionname=firstchat.sessionname

  useEffect(() => {
    if (firstchat?.query && !firstChatProcessed.current) {
      const processFirstChat = async () => {
        firstChatProcessed.current = true
        
        // Add human message to chat
        setMessage(e => [...e, {role:"human",content:firstchat.query}])
        
        try {
          await upload("human",firstchat.query,sessionname)
          setIsSearching(true)
          //should search or think
          const shouldsearch = await searchOrweb(firstchat, setIsSearching,setState)
          console.log('First chat search:', shouldsearch)
          
          //search query
          const AImsg=await handleform(shouldsearch, setIsSearching, setMessage)
          if (AImsg) {
            await upload("AI", AImsg,sessionname)
          }
        } catch (error) {
          console.error('Error processing first chat:', error)
          setIsSearching(false)
        }
      }
      
      processFirstChat()
    }
  }, [firstchat])

  useEffect(() => {
    if (query.query && query.query !== firstchat?.query) {
      const processQuery = async () => {
        //update the human message in chat
        setMessage(e => [...e, {role:"human",content:query.query}])
        
        try {
          //should search or think
          await upload("human",query.query,sessionname)
          const shouldsearch = await searchOrweb(query, setIsSearching,setState)
          console.log('Regular query search:', shouldsearch)
          
          //search query
          const AImsg=await handleform(shouldsearch, setIsSearching, setMessage)
          if(AImsg){
            await upload("AI",AImsg,sessionname)
          }
        } catch (error) {
          console.error('Error processing query:', error)
          setIsSearching(false)
        }
      }
      
      processQuery()
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
    fetchMessages();
  }, [])

  useEffect(() => {
    window.scrollTo({left:0, top:document.body.scrollHeight,behavior:'smooth'});
  }, [message]);

  return (
    <div className={`${className}`}>
      <div
        className='md:w-[70%] w-full max-w-182 h-full mx-auto flex flex-col gap-6 items-center pb-24'>
        {
          message?.map((item, i) => (
            <div key={i} className={`w-[95%] flex rounded-3xl ${item.role == "AI" ? 'justify-start' : 'justify-end'}`}>
              <h1 className={` ${item.role == "AI" ? 'justify-start w-[97%]' : 'bg-[#292929] max-w-[80%]'} py-3 px-4 rounded-3xl `}>{item.role=='AI' ?  <AiResponse content={item.content}/> :item.content}</h1>
            </div>
            // {(i+1)%2==0 ? <Separator className='w-[75%] mt-6 mb-4 bg-gray-700' /> :null}
          ))
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
  )
}

export default Chat