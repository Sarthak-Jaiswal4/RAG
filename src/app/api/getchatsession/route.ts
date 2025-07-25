import DBconnection from "@/lib/Connection";
import userModel from "@/models/user.model";
import chatSessionModel from "@/models/chat.model";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

await DBconnection()

export async function GET(req:Request){
    try {
        const { sessionClaims } = await auth()

        const email = sessionClaims?.email

        if (!email) {
            return NextResponse.json({ status: 404, response: "No email found" })
        }

        // First find the user
        const user = await userModel.findOne({ email })
        if (!user) {
            return NextResponse.json({ status: 404, response: "No user found" })
        }

        // Then find chat sessions for this user
        const chatSessions = await chatSessionModel.find({ userid: user._id })
        
        return NextResponse.json({status: 200, response: chatSessions})

    } catch (error:any) {
        console.log('Error in extracting chatsession API',error)
        return NextResponse.json({ status: 404, response: "Error in finding chat by user" })
    }
}