'use client'
import React from 'react'

function LinkDialogue({Link}:{Link:string | undefined}) {
  return (
    <p className='bg-[#262626] px-3 py-2 rounded-xl'>{Link}</p>
  )
}

export default LinkDialogue