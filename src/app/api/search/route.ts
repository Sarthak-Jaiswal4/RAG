import { DoWebSearch } from "../../../helper/action";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request:Request){
    try {
        const { query, type,confidence,decision } = await request.json() as {
            query: string;
            type: string | undefined;
            confidence:number,
            decision:string,
        };

        const response= await DoWebSearch(decision,confidence,query,type)
        return NextResponse.json({status:200,response:response})

    } catch (error:any) { 
        console.log('Error in search API',error)
        return NextResponse.json(
            {
              error: 'Internal Server Error',
              message: (error as Error).message,
            },
            { status: 500 }
        );
    }
}