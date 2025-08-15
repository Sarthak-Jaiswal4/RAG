'use client'
import React from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
  } from "@/components/ui/tooltip"

function HoverLabel({children,content}:{children:any,content:string}) {
  return (
    <Tooltip>
        <TooltipTrigger className='relative'>{children}</TooltipTrigger>
        <TooltipContent>
            <p>{content}</p>
        </TooltipContent>
    </Tooltip>
  )
}

export default HoverLabel