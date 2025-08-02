import { NextResponse } from "next/server"
import Helper from "@/helper/Helper"
import { StoringChatSession } from "@/Database/queries"
import { auth } from "@/auth"
import userModel from "@/models/user.model"
import { ChatSession } from "@/models/chat.model"
import DBconnection from "@/lib/Connection"

await DBconnection()
export async function POST(request:Request){
    try {
        const {data}=await request.json() as {data:string}
        const session = await auth()
        const email=session?.user?.email
        
        if(!email) {
            return NextResponse.json({status:401,response:"Unauthorized - No email found"})
        }
        
        const user=await userModel.findOne({
            email
        })

        if(!user) {
            return NextResponse.json({status:400,response:"no user found"})
        }

        const extractedName=await Helper.TitleExtractor(data)

        const datas={
            userid:user._id,
            sessionname:extractedName,
            messages:[],
            memories:[],
        }
        const createChat=await StoringChatSession(datas)

        if(!createChat || !createChat._id){
            return NextResponse.json({status:400,response:"Error in creating chat"})
        }

        const updateduser=await userModel.findOneAndUpdate(
            {email},
            { $push: { chats: createChat._id } },
            { new: true }    // return the updated user if you need it
        );
        console.log(updateduser)

        return NextResponse.json({status:200,response:{"extractedName":extractedName,"chatid":createChat._id}})

    } catch (error:any) {
        console.log('error in extracting name for the session',error)
        return NextResponse.json({status:500,response:error})
    }
}