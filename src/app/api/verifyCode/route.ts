import DBconnection from "@/lib/Connection"
import userModel, { User } from "@/models/user.model"
import mongoose from "mongoose"
import { NextResponse } from "next/server"

await DBconnection()
export async function POST(request:Request){
    try {
        const {code,id}= await request.json()as {
            code:string,id:string
        }
        if(!code){
            console.log('No verification code is present')
            return NextResponse.json({status:404,message:"Error no OTP code present"})
        }

        const user:any=await userModel.findById(id)

        const isexpiry:boolean= new Date(user.ExpiryTime) > new Date() 
        const iscodesame=user.verificationcode==code

        if (!iscodesame) {
            return NextResponse.json({status:201,message:"Verification code is incorrect"})
        }
        if(!isexpiry){
            return NextResponse.json({status:201,message:"Verification code has expired"})
        }
        user.isverified=true
        await user.save()

        return NextResponse.json({status:200,message:"Verification code is correct",user})

    } catch (error) {
        console.log('Error in verifying Verification code API',error)
        return NextResponse.json({status:500,message:"Error in verifying Verification code"})
    }
}