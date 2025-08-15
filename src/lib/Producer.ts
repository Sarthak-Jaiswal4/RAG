'use server'
import { auth } from '@/auth'
import {Queue} from 'bullmq'
import { cookies } from 'next/headers'

const ChatUploadQueue= new Queue('chatUploadQueue')

export async function init(role: string, content: string,sessionname:string,sourceList?:string[]){
    const token = await cookies()
    const session=token.get('authjs.session-token')

    if (!token) {
        console.log('No JWT token found')
        return
    }
    const res=await ChatUploadQueue.add('Upload message',{
        role,
        content,
        sessionname,
        sourceList,
        authToken: session
    })
    console.log("Job added",res.id)
}
