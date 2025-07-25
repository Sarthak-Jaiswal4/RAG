import React, { useEffect, useState } from 'react'
import Searchbar from './Searchbar'
import Chat from './Chat'
import { formvalues } from '@/types/formvalues'
import { messagetype } from '@/types/messagetype'
import axios from 'axios'

interface ChatsectionProps {
  userquery:formvalues,
  isSearching?: boolean
}

function Chatsection({userquery }: Partial<ChatsectionProps>) {
  const [load, setLoad] = useState<formvalues>({
    query: "", 
    type: ""
  });

  return (
    <div className='w-full h-full flex flex-col justify-center items-center text-white gap-2 relative'>
        <Chat query={load} firstchat={userquery} className='h-full w-full pb-[130px]'/>
        <div className="w-full h-[135px] z-10 fixed bottom-0">
          <Searchbar className='w-full h-full' search={setLoad}/>
        </div>
    </div>
  )
}

export default Chatsection