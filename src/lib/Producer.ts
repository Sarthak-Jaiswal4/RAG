'use server'
import {Queue} from 'bullmq'
import { cookies } from 'next/headers'
import { writeFile } from "fs/promises";
import path from "path";
import { UploadS3 } from './S3bucket';

const ChatUploadQueue= new Queue('chatUploadQueue',{
    connection: {
      host: "localhost",
      port: 6379,           
    },
  });
const FileUploadQueue=new Queue('fileuploadqueue',{
    connection: {
      host: "localhost",
      port: 6379,           
    },
  })

export async function init(role: string, content: string,sessionname:string,sourceList?:string[]){
    const token = await cookies()
    const authjs_session_token=token.get('authjs.session-token')
    const authjs_csrf_token=token.get('authjs.csrf-token')
    const authjs_callback_url=token.get('authjs.callback-url')

    // console.log(authjs_session_token,authjs_csrf_token,authjs_callback_url)
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

export async function Upload(File:File){

    const filename = File.name.replaceAll(" ", "_")
    console.log("fileName",filename);
    const uploaded:any = await UploadS3(File,filename)
    if(uploaded.$metadata.httpStatusCode==200){
        const res = await FileUploadQueue.add('Upload file', {
            filename
        })
    }
    else{
        console.error("something when wrong cannot uplaod to the queue")
        throw new Error("Error in uploading file to queue")
    }
    console.log("Job added")
}
