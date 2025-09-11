import { NextRequest, NextResponse } from 'next/server';
import { ReJsonAgent, ReThinkingAgent } from '@/helper/agent';

export async function POST(req: NextRequest) {
  try {
    const { prevJson, query } = await req.json();

    // Call the agent with the provided prevJson and query
    const agentResult = await ReThinkingAgent({ query, json: prevJson })
    const res=agentResult.content
    console.log(res)

    const newjson=await ReJsonAgent({inijson:prevJson,newjson:agentResult.content})
    const res2=newjson.content
    console.log(res2)

    return NextResponse.json({res2,res}, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error}, { status: 500 });
  }
}
