'use server'
import {Queue} from 'bullmq'
import { cookies } from 'next/headers'
import { writeFile } from "fs/promises";
import path from "path";

const ChatUploadQueue= new Queue('chatUploadQueue',{
    connection: {
      host: "65.0.30.180",
      port: 6379,           
    },
  });
const FileUploadQueue=new Queue('fileuploadqueue',{
    connection: {
      host: "65.0.30.180",
      port: 6379,           
    },
  })

export async function init(role: string, content: string,sessionname:string,sourceList?:string[]){
    const token = await cookies()
    const authjs_session_token=token.get('__Secure-authjs.session-token')
    const authjs_csrf_token=token.get('__Host-authjs.csrf-token')
    const authjs_callback_url=token.get('__Secure-authjs.callback-url')

    console.log(token,authjs_session_token,authjs_csrf_token,authjs_callback_url)
    if (!token) {
        console.log('No JWT token found')
        return
    }
    const res=await ChatUploadQueue.add('Upload message',{
        role,
        content,
        sessionname,
        sourceList,
        authjs_session_token: authjs_session_token,
        authjs_csrf_token:authjs_csrf_token,
        authjs_callback_url:authjs_callback_url
    })
    console.log("Job added",res.id)
}

export async function Upload(File:any){

    const buffer = Buffer.from(await File.arrayBuffer())
    const filename = File.name.replaceAll(" ", "_")
    console.log(filename);
    await writeFile(
        path.join(process.cwd(), "public/assets/" + filename),
        buffer
    );

    const res = await FileUploadQueue.add('Upload file', {
        filename
    })
    console.log("Job added")
}
