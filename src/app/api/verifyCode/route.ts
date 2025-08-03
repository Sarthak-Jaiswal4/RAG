import DBconnection from "@/lib/Connection"
import userModel, { User } from "@/models/user.model"
import { NextResponse } from "next/server"

await DBconnection()
export async function POST(request:Request){
    try {
        const {code,id}= await request.json()as {
            code:string,id:string
        }
        if(!code){
            console.log('no code is present')
            return NextResponse.json({status:404,message:"Error no OTP code present"})
        }

        const user:any=await userModel.findById(id)
        console.log(user)
        const iscodesame=user.code===code
        if (!iscodesame) {
            return NextResponse.json({status:200,message:"OTP is incorrect"})
        }

        return NextResponse.json({status:200,message:"OTP is correct"})

    } catch (error) {
        console.log('Error in verifying OTP API',error)
        return NextResponse.json({status:500,message:"Error in verifying OTP"})
    }
}