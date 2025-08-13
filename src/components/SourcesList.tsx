'use client'
import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

function SourcesList({SourceList}:{SourceList:Array<string>}) {
  return (
    <SheetContent className='dark text-[#F4F1ED] bg-[#272727]'>
    <SheetHeader>
      <SheetTitle className='text-2xl'>Sources</SheetTitle>
      <SheetDescription>
        Website searched for the query
      </SheetDescription>
    </SheetHeader>
    <div className="flex justify-center flex-col px-3 gap-2">
        {SourceList.map(e =>(
        <div className="flex py-2 px-2 bg-[#313131] rounded-2xl border-1 flex-wrap text-wrap">
            <a href={e} className='text-wrap px-2'>{e}</a>
        </div>
        ))}
    </div>
  </SheetContent>
  )
}

export default SourcesList