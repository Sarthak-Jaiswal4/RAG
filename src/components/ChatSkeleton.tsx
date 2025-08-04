'use client'
import React from 'react'
import { Skeleton } from './ui/skeleton'

function ChatSkeleton() {
    return (
        <>
            {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx}
                    className={`flex md:w-full w-[80%]  flex-col gap-4 space-x-4 ${
                        idx % 2 == 0 ? 'items-start' : 'items-end'
                    }`}
                >
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
            ))
        }
        </>
    )
}

export default ChatSkeleton