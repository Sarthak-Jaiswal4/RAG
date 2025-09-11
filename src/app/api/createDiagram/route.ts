import { Jsongenerator, StepPlannerAgent } from "@/helper/agent";
import DBconnection from "@/lib/Connection";
import { NextResponse } from "next/server";

export async function POST(request:Request){
    await DBconnection()
    try {
        const {query}=await request.json() as {
            query:string
        }

        const agent=await StepPlannerAgent(query)
        const jsonanswer=agent.content as string
        console.log(jsonanswer)

        const jsongenerator=await Jsongenerator({input:jsonanswer})
        const jsonanswer2=jsongenerator.content
        console.log(jsonanswer2)
        return NextResponse.json({jsonanswer,jsonanswer2},{status:200})

    } catch (error) {
        console.log("Error in creating diagram API",error)
        return NextResponse.json({status:500,error:"Error from API"})
    }
}