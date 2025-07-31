'use client'
import React, { useState } from 'react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
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
import { SignedOut, SignInButton, useUser ,SignedIn, UserButton} from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { SidebarGroupContent, SidebarTrigger } from "@/components/ui/sidebar";
import ErrorDialogue from './ErrorDialogue'

interface props {
  className?:string
}

function Header({className}:props) {
  const { isSignedIn, user,isLoaded } = useUser();
  const router=useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  return (
    <>
      <div className={`w-full h-auto px-4 flex flex-row items-center py-4 backdrop-blur-lg ${className}`}>
      {isLoaded && (
        <div className='flex justify-between items-center w-full h-full'>
          <div className='flex items-center bg-[#171717]'>
            <SidebarGroupContent className="dark sm:hidden flex sticky top-2 left-0 z-10 h-full bg-[#191919] w-full py-2 inset-2">
              <SidebarTrigger />
            </SidebarGroupContent>
            <h1 className='text-2xl font-normal cursor-pointer' onClick={() => router.push('/')}>Prarambh</h1>
          </div>
          <div className='flex gap-3 items-center'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className=' bg-[#292929] rounded-3xl border-0' variant="outline">More</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full py-2 dark rounded-2xl dark flex flex-col justify-center items-center bg-[#252525]">
                <DropdownMenuItem className='pb-2 flex hover:bg-red-600' onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className='text-red-400 size-5'/>
                  <h1 className='text-red-400 px-1'>
                    Delete
                  </h1>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share className='text-white size-5'/>
                  <h1 className='text-white px-1'>
                    Share
                  </h1>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
              
               <SignedIn>
                 <UserButton />
               </SignedIn>
            <SignedOut>
                <Button onClick={()=>router.push('/login') } className='px-3 py-3 rounded-3xl cursor bg-[#303030] border-0' variant='outline'>Sign in</Button>
            </SignedOut>
          </div>
        </div>
      )}
      </div>
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

export default Header