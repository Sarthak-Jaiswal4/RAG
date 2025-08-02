import { UpdateUserMessage } from "@/Database/queries"
import DBconnection from "@/lib/Connection"
import userModel from "@/models/user.model"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

await DBconnection()
export async function POST(request:Request){
    try {
        const { role, content,sessionname } = await request.json() as {
            role: string;
            content: string;
            sessionname:string
        };

        const session = await auth()
        const email = session?.user?.email
        if(!email || !content){
            return NextResponse.json({ status: 401, response: "Unauthorized - No email found" })
        }

        const user=await userModel.findOne({email})
        if(!user){
            return NextResponse.json({ status: 404, response: "Error in finding user by email" })
        }

        if (typeof content === "string") {
            let Usermessage:{role:string,content:string} = {
                role,
                content
            };
            const updateMessage=await UpdateUserMessage(user._id,sessionname,Usermessage)
            console.log("message updated")
            if(!updateMessage){
                return NextResponse.json({ status: 404, response: "Error in updating message" })
            }
            return NextResponse.json({status:200,response:updateMessage})
        }

    } catch (error:any) {
        console.log('Error in extracting chatsession API')
        return NextResponse.json({ status: 500, response: "Error in finding chat by user" })
    }
}