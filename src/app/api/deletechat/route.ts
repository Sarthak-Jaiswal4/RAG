import { Deletechat } from "@/Database/queries"
import DBconnection from "@/lib/Connection"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

await DBconnection()
export async function POST(request: Request) {
    try{
        const {chatid}=await request.json() as{
            chatid:string
        }

        if(!chatid){
            return NextResponse.json({
                status:400,
                response:"chatid is required"
            })
        }

        const { sessionClaims } = await auth()
        const email = sessionClaims?.email
        if(!email){
            return NextResponse.json({ status: 404, response: "Error in finding email" })
        }

        const chat=await Deletechat(chatid)
        if(!chat){
            return NextResponse.json({
                status:404,
                response:"chat not found or something went wrong"
            })
        }

        return NextResponse.json({
            status:200,
            response:"chat deleted successfully"
        })
    }catch{
        return NextResponse.json({
            status:500,
            response:"Something went wrong in deleting chat"
        })
    }

}