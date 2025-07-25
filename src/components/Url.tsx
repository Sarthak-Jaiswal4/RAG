'use client'
import React from 'react'

function Url({content}:{content:string}) {
    const [before, url, after]=URLextractor(content)

    function URLextractor(text:string){
        let regex = /(https?:\/\/[^\s)]+)/i
        const match = text.match(regex)
        if (!match) return [text]
        const url = match[0]
        const [before, afterWithParen] = text.split(url)
        // If your URLs are inside parentheses, strip the closing “)” off the end
        const after = afterWithParen.startsWith(')') ? afterWithParen.slice(1) : afterWithParen
        return [before, url, after]
    }

  return (
    <h1>
         {before}
         <a  href={url} className='text-[12px] bg-gray-700 rounded-lg px-[2px] py-[2px]'>{url}</a>
         {after}
    </h1>
  )
}

export default Url