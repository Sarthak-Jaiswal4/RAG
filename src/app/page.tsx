'use client'
import { AppSidebar } from "@/components/AppSidebar"
import Header from "@/components/Header"
import { Pdfs } from "@/components/Pdfs"
import Searchbar from "@/components/Searchbar"
import { useModel } from "@/store/store"
import { chatsessiontype } from "@/types/chatsessiontype"
import { formvalues } from "@/types/formvalues"
import axios from "axios"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

export default function Home() {
  const {data:session,status}=useSession()
  const router=useRouter()
  const model=useModel((state)=> state.model)
  const [chatsessionupdate, setchatsessionupdate] = useState<chatsessiontype>({
    id:"",
    title:"",
    url:"",
    createdAt:""
  })

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

  const firstquery=async(payload:formvalues)=>{
    try {
      if(isAuthenticated){
        await axios.post("/api/extractName",{data:payload.query}).then((r) => { 
          console.log(r.data.response)
          const query=payload.query
          const type=payload.type as string
          const typeofmodel=payload.typeofmodel
          const newquery={
            id:r.data.response.chatid,
            title:r.data.response.extractedName,
            url:`/chat/${r.data.response.chatid}`,
            createdAt:"9876"
          }
          setchatsessionupdate(newquery)
          upload("human",payload.query,r.data.response.chatid)
          sessionStorage.setItem(
            "initialPayload",
            JSON.stringify({ message: query, type: type, typeofmodel:typeofmodel })
          );
          router.push(`/chat/${r.data.response.chatid}`)
  
        }).catch(err => console.log("error in extracting name API call",err))
      }
      else{
        sessionStorage.setItem(
          "initialPayload",
          JSON.stringify({ message: payload.query, type: payload.type, })
        );
        router.push(`/chat/temp`)
      }

    } catch (error:any) {
      console.log('Error in creating first chat')
      throw new Error(error)
    }
  }

  const isAuthenticated=useMemo(() => status==='authenticated', [status])

  return (
    <div className="w-full sm:h-full h-screen max-h-screen bg-[#1A1A1A] text-[#F4F1ED] flex">
      <AppSidebar chatsession={chatsessionupdate}/>
      <div className="w-full h-screen flex flex-col justify-center items-center relative">
        <Header/>
        {model.LM=="RAG" && 
        <Pdfs className={'absolute top-[20px] left-4'} />
        }
        <div className="flex justify-center items-center text-center pb-[7vw] md:pb-[52px] gap-[40px] flex-col w-full h-full">
          {/* {isAuthenticated ? <h1 className="md:text-[2.5vw] text-[8.5vw] font-semibold">Hello {session?.user?.name}</h1> : null} */}
          <div className="flex flex-col gap-2">
            <h1 className="flex justify-center items-center md:text-[3.5rem] font-bold text-[2.75rem] text-wrap text-center leading-12 bg-[#E27D60] bg-clip-text text-transparent z-20 ">Lamda</h1>
            <p className="flex justify-center items-center md:text-[1.6rem] text-[1.3rem] text-wrap text-center font-medium">Let's explore your questions together!</p>
          </div>
          <Searchbar dosearch={firstquery}/>
        </div>
      </div>
    </div>
  )
}
