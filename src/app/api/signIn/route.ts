import { NextResponse } from "next/server"
import bcrypt from 'bcrypt'
import userModel from "@/models/user.model"

export async function POST(request:Request){
    try {
        const {name,email,password}=await request.json()

        if(!name || !email || !password){
            console.log('Missing credential')
            return NextResponse.json({status:404,message:"Error Missing credential"})
        }

        const hashedpassword=await bcrypt.hash(password,10)
        const verificationcode= Math.floor(100000 + Math.random()* 900000).toString()
        const ExpiryTime= new Date()
        ExpiryTime.setMinutes(ExpiryTime.getMinutes() + 10)

        const createdUser=await userModel.create({
            username:name,
            email,
            password:hashedpassword,
            verificationcode,
            ExpiryTime
        })

        if(!createdUser){
            console.log('Error in creating user in database')
            return NextResponse.json({status:400,message:"Error creating user in database"})
        }

        return NextResponse.json({status:200,message:"new User signed up",createdUser})

    } catch (error) {
        console.log('Error in Signing up user',error)
        return NextResponse.json({status:500,message:"Error in Signing up user"})
    }
}