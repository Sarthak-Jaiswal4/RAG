'use client'
import { Sidebar, SidebarContent, SidebarMenuItem, SidebarMenuButton, SidebarMenu, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarTrigger, SidebarFooter, SidebarMenuAction } from "@/components/ui/sidebar"
import { ChevronUp, MoreHorizontal, Plus, Search, Trash2, User2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { useSidebar } from "@/components/ui/sidebar"
import { useEffect } from "react"
import { chatsessiontype } from "@/types/chatsessiontype"
import axios from "axios"
import { useState } from "react";
import ErrorDialogue from "./ErrorDialogue"
import { useParams } from "next/navigation"

interface AppSidebarProps {
  chatsession?: chatsessiontype
}

interface chat {
  id: string,
  title: string,
  url: string,
  createdAt: string
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
  const { setOpen } = useSidebar()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const chatid=useParams()

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

  useEffect(() => {
    if (chatsession && chatsession.url !== "") {
      setChats(prevChats => [chatsession, ...prevChats])
    }
    setOpen(false)
    getchats()
  }, [chatsession])

  return (
    <>
      <Sidebar className="dark text-white border-r-2 bg-[#191919] border-gray-700 overflow-y-auto " collapsible="icon">
        <SidebarContent className="bg-[#191919]">
          <SidebarGroup>
            <SidebarGroupContent className="sticky top-2 left-0 z-10 h-full text-white bg-[#191919] w-full py-2 inset-2">
              <SidebarTrigger />
            </SidebarGroupContent>
            <SidebarGroupContent className="pt-4 text-white">
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
            <div className="group-data-[collapsible=icon]:hidden text-white">
              <SidebarGroupLabel className="pb-4 pt-8 text-base text-gray-400">Chats</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {chats.toReversed().map((item) => (
                    <SidebarMenuItem key={item.id} className="group" >
                      <SidebarMenuButton className={`${item.id===chatid.id ? `bg-[#272727]` : null} flex`} asChild>
                        <a href={item.url}>
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuAction className="">
                            <MoreHorizontal />
                          </SidebarMenuAction>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="dark" side="right" align="start">
                          <DropdownMenuItem className='pb-2 flex hover:bg-red-600' onClick={() => setShowDeleteDialog(true)}>
                            <Trash2 className='text-red-400 size-5' />
                            <h1 className='text-red-400 px-1'>
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
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="bg-[#191919] w-full text-white">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User2 /> Username
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-full dark"
                >
                  <DropdownMenuItem>
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span className="text-red-400">Logout</span>
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
        />
      )}
    </>
  )
}