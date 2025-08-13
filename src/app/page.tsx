'use client'
import { AppSidebar } from "@/components/AppSidebar"
import Header from "@/components/Header"
import Searchbar from "@/components/Searchbar"
import { chatsessiontype } from "@/types/chatsessiontype"
import { formvalues } from "@/types/formvalues"
import axios from "axios"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

export default function Home() {
  const {data:session,status}=useSession()
  const router=useRouter()
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
            JSON.stringify({ message: query, type: type, })
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
    <div className="w-full sm:h-full h-screen max-h-screen bg-[#1A1A1A] text-[#F4F1ED] relative flex">
      <AppSidebar chatsession={chatsessionupdate}/>
      <div className="w-full h-screen flex flex-col justify-center items-center">
        <Header/>
        <div className="flex justify-center items-center text-center pb-[6.5vw] gap-8 flex-col w-full h-full">
          {/* {isAuthenticated ? <h1 className="md:text-[2.5vw] text-[8.5vw] font-semibold">Hello {session?.user?.name}</h1> : null} */}
          <div className="flex flex-col">
            <h1 className="flex justify-center items-center md:text-[3rem] font-poppins font-semibold text-[2.75rem] text-wrap text-center" >Lamda</h1>
            <h3 className="flex justify-center items-center md:text-[1.6rem] text-[1.3rem] text-wrap text-center">Let's explore your questions together!</h3>
          </div>
          <Searchbar dosearch={firstquery}/>
        </div>
      </div>
    </div>
  )
}
