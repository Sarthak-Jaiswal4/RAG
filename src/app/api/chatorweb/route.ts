import { DoWebSearch, shoudldosearch } from "@/helper/action";
import { NextResponse } from "next/server";


export async function POST(request:Request){
    try {
        const { query, type } = await request.json() as {
            query: string;
            type: string | undefined;
        };

        const response= await shoudldosearch(query)
        console.log(response)

        let status:string;
        if(response.decision=="ANSWER" && response.confidence>=6 && type!='Web Search'){
            status="thinking"
        }else{
            status="Searching web"
        }
        return NextResponse.json({ status: 200, response: response, state: status,type: type })

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