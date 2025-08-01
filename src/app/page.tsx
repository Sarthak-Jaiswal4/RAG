'use client'
import { AppSidebar } from "@/components/AppSidebar"
import Header from "@/components/Header"
import Searchbar from "@/components/Searchbar"
import { chatsessiontype } from "@/types/chatsessiontype"
import { formvalues } from "@/types/formvalues"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Home() {
  const router=useRouter()
  const [chatsessionupdate, setchatsessionupdate] = useState<chatsessiontype>({
    id:"",
    title:"",
    url:"",
    createdAt:""
  })

  const firstquery=async(payload:formvalues)=>{
    try {
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
        sessionStorage.setItem(
          "initialPayload",
          JSON.stringify({ message: query, type: type })
        );
        router.push(`/chat/${r.data.response.chatid}`)

      }).catch(err => console.log("error in extracting name API call",err))

    } catch (error:any) {
      console.log('Error in creating first chat')
      throw new Error(error)
    }
  }

  return (
    <div className="w-full sm:h-full h-screen max-h-screen bg-[#171717] text-white relative flex">
      <AppSidebar chatsession={chatsessionupdate}/>
      <div className="w-full h-screen flex flex-col justify-center items-center">
        <Header/>
        <h1 className="w-full h-full flex justify-center items-center md:text-[2vw] text-[7vw] text-semibold text-wrap text-center">Let's explore your questions together!</h1>
        <div className="w-full h-full flex flex-col justify-end items-center">
          <Searchbar dosearch={firstquery}/>
        </div>
      </div>
    </div>
  )
}
