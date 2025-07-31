'use client'
import React from 'react'
import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

function ErrorDialogue({ title, desc, type, window }: { title: string; desc: string; type: string, window:any }) {
    return (
        <div className='fixed inset-0 flex justify-center items-center z-50 bg-black/50 backdrop-blur-sm'>
            <Card className="w-full flex gap-1 max-w-sm bg-[#252525] text-white dark shadow-2xl">
                <CardHeader>
                    <CardTitle className='text-md'>{title}</CardTitle>
                </CardHeader>
                <CardContent className='text-gray-400 text-sm'>
                    {desc}
                </CardContent>
                <CardFooter className="flex-col flex gap-2 w-full justify-end items-end pt-4">
                    {type === "delete"
                        ?
                        <div className='flex gap-4 '>
                            <Button variant="outline" onClick={()=> window(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive">
                                Delete
                            </Button>
                        </div>
                        :
                        <Button variant="outline" className="" onClick={()=> window(false)}>
                            Okay
                        </Button>
                    }
                </CardFooter>
            </Card>
        </div>
    )
}

export default ErrorDialogue