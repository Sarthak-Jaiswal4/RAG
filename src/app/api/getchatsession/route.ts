import DBconnection from "@/lib/Connection";
import userModel from "@/models/user.model";
import chatSessionModel from "@/models/chat.model";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

await DBconnection()

export async function GET(req:Request){
    try {
        const session = await auth()

        if (!session?.user?.email) {
            return NextResponse.json({ status: 401, response: "Unauthorized - No email found" })
        }

        // First find the user
        const user = await userModel.findOne({ email: session.user.email })
        if (!user) {
            return NextResponse.json({ status: 404, response: "No user found" })
        }

        // Then find chat sessions for this user
        const chatSessions = await chatSessionModel.find({ userid: user._id })
        
        return NextResponse.json({status: 200, response: chatSessions})

    } catch (error:any) {
        console.log('Error in extracting chatsession API',error)
        // Return a more specific error message based on the error type
        if (error.message?.includes('secret')) {
            return NextResponse.json({ status: 500, response: "Authentication configuration error" })
        }
        if (error.message?.includes('database')) {
            return NextResponse.json({ status: 500, response: "Database connection error" })
        }
        return NextResponse.json({ status: 500, response: "Error in finding chat by user" })
    }
}