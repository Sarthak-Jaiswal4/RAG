import userModel, { User } from "@/models/user.model";
import bcrypt from 'bcrypt'
import { NextResponse } from "next/server";

export async function POST(request:Request){
    try {
        const {email,password}= await request.json()
        if(!password || !email){
            return NextResponse.json({
                status:400,
                message:"Some credentials are missing"
            })
        }
        const user:any=await userModel.findOne({email})
        if(!user){
          throw new Error("No user found")
        }
        const ispassword= await bcrypt.compare(password,user?.password)
        if(!ispassword){
          throw new Error("Incorrect Password")
        }
        const safeUser = {
          id:         user._id.toString(),
          email:      user.email,
          name:       user.username,
          isverified: user.isverified,
        };
        return NextResponse.json({status:200,message:"Logined successfully",safeUser})
    } catch (error) {
        console.log(error)
        return NextResponse.json({status:500,message:"Logined falied"})
    }
}