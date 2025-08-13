import React, { useEffect, useRef, useState } from 'react'
import Searchbar from './Searchbar'
import Chat from './Chat'
import { formvalues } from '@/types/formvalues'

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
    <div className='w-full h-full flex flex-col justify-center items-center text-[#F4F1ED] gap-2 relative'>
        <Chat query={load} firstchat={userquery} className='h-full w-full pb-30'/>
        <div className="w-full h-auto fixed bottom-[-24px] z-10">
          <Searchbar className='w-full h-full' search={setLoad}/>
        </div>
    </div>
  )
}

export default Chatsection