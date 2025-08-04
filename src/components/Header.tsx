'use client'
import React, { useEffect, useState, useMemo } from 'react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Delete, Share, Trash, Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import { useParams, useRouter } from 'next/navigation'
import { SidebarGroupContent, SidebarTrigger } from "@/components/ui/sidebar";
import ErrorDialogue from './ErrorDialogue'
import axios from 'axios'
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react';

interface props {
  className?: string
}

function Header({ className }: props) {
  const chatid = useParams()
  const router = useRouter()
  const { data: session, status } = useSession();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteChat, setDeleteChat] = useState(false)

  const handleDeleteChat = async () => {
    try {
      const response = await axios.post('/api/deletechat', {
        chatid: chatid.id
      })
      if (response.status === 200) {
        router.push('/')
      }
    } catch (error) {
      console.log('Error in deleting chat', error)
    }
  }

  useEffect(() => {
    if (deleteChat) {
      handleDeleteChat()
    }
  }, [deleteChat])

  // Memoize the authentication status to prevent unnecessary re-renders
  const isAuthenticated = useMemo(() => status === "authenticated", [status])
  const isChatPage = useMemo(() => typeof(chatid.id) === 'string', [chatid.id])

  return (
    <>
      <div className={`w-full h-[70px] md:h-[60px] px-4 flex flex-row items-center py-4 backdrop-blur-md ${className}`}>
        
          <div className='flex justify-between items-center w-full h-full backdrop-blur-md'>
            <div className='flex items-center backdrop-blur-md rounded-xl px-2 py-1'>
              <SidebarGroupContent className="sm:hidden flex sticky top-2 left-0 z-10 h-full backdrop-blur-md w-full py-2 inset-2">
                <SidebarTrigger />
              </SidebarGroupContent>
              <h1
                className='text-2xl font-normal cursor-pointer'
                onClick={() => router.push('/')}
              >
                Prarambh
              </h1>
            </div>
            <div className='flex gap-3 items-center'>
              {isChatPage && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className=' bg-[#292929] rounded-3xl border-0 cursor-pointer' variant="outline">More</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full py-2 dark rounded-2xl dark flex flex-col justify-center items-center bg-[#252525] shadow-2xl/30 border-0">
                    <DropdownMenuItem className='pb-2 flex hover:bg-red-600 cursor-pointer' onClick={() => setShowDeleteDialog(true)}>
                      <Trash2 className='text-red-400 size-5' />
                      <h1 className='text-red-400 px-1'>
                        Delete
                      </h1>
                    </DropdownMenuItem>
                    <DropdownMenuItem className='cursor-pointer'>
                      <Share className='text-white size-5' />
                      <h1 className='text-white px-1'>
                        Share
                      </h1>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {isAuthenticated ? (
                <div>
                  <Button onClick={() => signOut()} className='px-3 py-3 rounded-3xl cursor bg-[#303030] border-0' variant='outline'>Sign Out</Button>
                </div>
              ) : (
                <div>
                  <Button onClick={() => router.push('/login')} className='px-3 py-3 rounded-3xl cursor bg-[#303030] border-0' variant='outline'>Sign in</Button>
                </div>
              )}
            </div>
          </div>
        
      </div>
      {showDeleteDialog && (
        <ErrorDialogue
          title='Delete'
          desc='Are you sure you want to permanently delete the current chat? This action cannot be undone and all messages in this conversation will be lost.'
          type='delete'
          window={setShowDeleteDialog}
          action={setDeleteChat}
        />
      )}
    </>
  )
}

export default Header