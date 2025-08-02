'use client'
import React from 'react'
import { Skeleton } from './ui/skeleton'

function ChatNameSkeleton() {
  return (
    <>
            {Array.from({ length: 5 }).map((_, idx) => (
                <div
                    className={`flex w-full pr-4 pb-4 flex-col gap-4 items-start `}
                >
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-[200px]" />
                        {/* <Skeleton className="h-4 w-[140px]" /> */}
                    </div>
                </div>
            ))
        }
        </>
  )
}

export default ChatNameSkeleton