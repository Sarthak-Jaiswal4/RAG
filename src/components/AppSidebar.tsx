'use client'
import { Sidebar, SidebarContent, SidebarMenuItem, SidebarMenuButton, SidebarMenu, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarTrigger, SidebarFooter, SidebarMenuAction } from "@/components/ui/sidebar"
import { ChevronUp, MoreHorizontal, Plus, Search, Trash2, User2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { useSidebar } from "@/components/ui/sidebar"
import { useEffect, useMemo, useRef } from "react"
import { chatsessiontype } from "@/types/chatsessiontype"
import axios from "axios"
import { useState } from "react";
import ErrorDialogue from "./ErrorDialogue"
import { useParams, usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import ChatNameSkeleton from "./ChatNameSkeleton"
import HoverLabel from "./HoverLabel"

interface AppSidebarProps {
  chatsession?: chatsessiontype
}

const items = [
  {
    title: "New Chat",
    url: "/",
    icon: Plus,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
]

export function AppSidebar({ chatsession }: AppSidebarProps) {
  const [chats, setChats] = useState<chatsessiontype[]>([]);
  const { setOpen,open } = useSidebar()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const chatid=useParams()
  const router=useRouter()
  const { data: session, status } = useSession();
  const [deleteaction, setdeleteaction] = useState(false)
  const [chatID, setchatID] = useState("")
  const pathname = usePathname()

  const getchats = async () => {
    try {
      await axios.get('/api/getchatsession')
        .then((res) => {
          const prevchats = res.data.response
          prevchats.map((e: { sessionname: string; _id: string, createdAt: string }) => (
            setChats((prev) => [
              ...prev,
              {
                id: e._id,
                title: e.sessionname,
                url: `/chat/${e._id}`,
                createdAt: `${Math.floor(Math.random() * 10000)}`
              }
            ])
          ))
        })
    } catch (error) {
      console.log(error)
    }
  }

  const DeleteChat=async()=>{
    try {
      await axios.post('/api/deletechat',{chatid:chatID})
      .then((e)=>{
        if(e.data.status==200){
          setShowDeleteDialog(false)
          if(pathname === '/'){
            router.refresh()
          }else{
            router.push('/')
          }
        }else{
          setShowDeleteDialog(false)
          console.log('Something went wrong',e.data)
        }
      })
      .catch((err)=>{
        console.log('Error in deleting chat',err)
      })
      .finally(()=>{
        setChats(prev => prev.filter(c => c.id != chatID));
      })
    } catch (error:any) {
      console.log('Error in deleting chat')
      throw new Error(error)
    }
  }

  useEffect(() => {
    if (chatsession && chatsession.url !== "") {
      setChats(prevChats => [chatsession, ...prevChats])
    }
    setOpen(false)
    getchats()
  }, [chatsession])

  useEffect(() => {
    if(deleteaction==true){
      DeleteChat()
    }
  }, [deleteaction])
  
  const isAuthenticated = useMemo(() => status === "authenticated", [status])
  const isLoading = useMemo(() => status === "loading", [status])

  return (
    <>
      <Sidebar className={`text-[#F4F1ED] border-r-2 bg-[#171717] border-gray-700 overflow-y-auto w-[260px] transition-all duration-400 ease-in-out`} collapsible="icon">
        <SidebarContent className="bg-[#171717]">
          <SidebarGroup>
            <SidebarGroupContent className="sticky top-0 left-0 z-10 h-full bg-[#171717] text-[#F4F1ED] w-full py-2 inset-2">
              <SidebarTrigger className="cursor-pointer" />
            </SidebarGroupContent>
            <SidebarGroupContent className="pt-4 text-[#F4F1ED]">
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem className="hover:bg-[#323232] rounded-xl" key={item.title}>
                    <SidebarMenuButton className=" hover:bg-[#323232] hover:text-[#F4F1ED]"  asChild>
                      <a className="hover:bg-[#323232]" href={item.url}>
                        {item.title==="New Chat" ? <HoverLabel content="New Chat"><item.icon size={22} className="text-[#E27D60]"/></HoverLabel> : <HoverLabel content="Search"><item.icon size={18}/></HoverLabel>}
                        {item.title==="New Chat" ? <span className="text-[#E27D60]">{item.title}</span> : <span>{item.title}</span>}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
            <SidebarGroupContent>
              <SidebarContent className="w-full">
                {isLoading ? (
                  <div className="group-data-[collapsible=icon]:hidden flex flex-col justify-center items-start overflow-hidden">
                    <h1 className="pb-4 pt-5 text-medium text-gray-400">Chats</h1>
                    <ChatNameSkeleton />
                  </div>
                ) : isAuthenticated ? (
                  <div className="group-data-[collapsible=icon]:hidden text-[#F4F1ED] overflow-x-hidden overflow-y-hidden">
                    <SidebarGroupLabel className="pb-4 pt-8 text-base text-gray-400">Chats</SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {chats.toReversed().map((item) => (
                          <SidebarMenuItem className="group" >
                            <SidebarMenuButton className={`${item.id===chatid.id ? `bg-[#272727]` : null} flex hover:text-[#F4F1ED] hover:bg-[#242424]`} asChild>
                              <a href={item.url}>
                                <span>{item.title}</span>
                              </a>
                            </SidebarMenuButton>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <SidebarMenuAction className="hover:bg-[#242424]">
                                  <MoreHorizontal className='text-[#F4F1ED] hover:bg-[#242424]'/>
                                </SidebarMenuAction>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="dark" side="right" align="start">
                                <DropdownMenuItem className='pb-2 flex hover:bg-red-600' onClick={() => setShowDeleteDialog(true)}>
                                  <Trash2 className='text-red-400 size-5' />
                                  <h1 onClick={()=> setchatID(item.id)} className='text-red-400 px-1'>
                                    Delete
                                  </h1>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </div>
                ) : (
                  <div className="group-data-[collapsible=icon]:hidden flex flex-col items-center justify-center h-[60vh] md:h-[30vw] p-6">
                    <div className="flex flex-col items-center gap-4">  
                      <p className="text-gray-400 text-center text-base max-w-xs">
                        Create an account or log in to save your conversations and access them anytime.
                      </p>
                      <Button
                        className="mt-2 px-6 py-2 text-black sm:text-[#F4F1ED] rounded-full shadow transition-all duration-200 font-medium text-base "
                        onClick={() => router.push("/login")}
                        variant='outline'
                      >
                        Sign In
                      </Button>
                    </div>
                  </div>
                )}
                
              </SidebarContent>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="bg-[#171717] w-full text-[#F4F1ED]">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="hover:bg-[#323232] hover:text-[#F4F1ED] cursor-pointer">
                    <User2 /> Username
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="md:w-[240px] w-full ml-2 dark"
                >
                  <DropdownMenuItem className="cursor-pointer">
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={()=> router.push('/')} className="cursor-pointer">
                    <button onClick={() => signOut()} className="text-red-400">Logout</button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      {showDeleteDialog && (
        <ErrorDialogue
          title='Delete'
          desc='Are you sure you want to permanently delete the current chat? This action cannot be undone and all messages in this conversation will be lost.'
          type='delete'
          window={setShowDeleteDialog}
          action={setdeleteaction}
        />
      )}
    </>
  )
}