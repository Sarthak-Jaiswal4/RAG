import { createuserViaGoogle } from "@/Database/queries";
import { NextResponse } from "next/server";
import DBconnection from "@/lib/Connection"

await DBconnection()
export async function POST(request:Request){
    try {
        const {name,email,email_verified}= await request.json()

        if(!name || !email || !email_verified){
            return NextResponse.json({
                status:400,
                message:"Some credentials are missing"
            })
        }

        const user=await createuserViaGoogle(name,email,email_verified)
        
        return NextResponse.json({
            status:200,
            message:'New User Created via google'
        })

    } catch (error) {
        return NextResponse.json({
            status:500,
            message:"Some error has occured while creating a user"
        })
    }
}