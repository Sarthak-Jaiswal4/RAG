'use client'
import React from 'react'
import Header from '@/components/Header'
import Chatsection from './Chatsection'

function Mainpage() {
  return (
    <div className='w-full h-full flex flex-col items-center relative overflow-y-auto'>
        <Header className='sticky top-0 z-10 backdrop-blur-[2px]' />
        <div className='flex-1 w-full h-full'>
            <Chatsection/>
        </div>
    </div>
  )
}

export default Mainpage