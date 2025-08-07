import AWSVerifyEmail from '@/components/email-template';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request:Request) {
  try {
    const {email,verificationCode}=await request.json() as {
        email:string,
        verificationCode:string
    }
    console.log(email,verificationCode)

    if(!email || !verificationCode){
        console.log("Credentail missing in sending email API")
        return NextResponse.json({
            status:401,
            message:"Missing Credentials"
        })
    }
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: `${email}`,
      subject: 'verification code',
      react: AWSVerifyEmail({ verificationCode: verificationCode }),
    });
    console.log(data,error)
    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json({status:200,data,message:"verificationcode send successfully"});
  } catch (error) {
    console.log(error)
    return Response.json({ error }, { status: 500 });
  }
}