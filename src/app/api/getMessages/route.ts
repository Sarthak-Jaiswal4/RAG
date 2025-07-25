import { GetMessages } from "@/Database/queries"
import DBconnection from "@/lib/Connection"
import { NextResponse } from "next/server"

await DBconnection()
export async function POST(request:Request){
    try {
      const { chatsessionid } = await request.json() as {
        chatsessionid: string;
      };

      if (!chatsessionid) {
        console.log("no chatsessionid found");
        return NextResponse.json({
          status: 400,
          response: "no chatsessionid found",
        });
      }

      const Messages = await GetMessages(chatsessionid);
      if (!Messages) {
        return NextResponse.json({
          status: 404,
          response: "Something went wrong",
        });
      }

      return NextResponse.json({ status: 200, response: Messages });
    } catch (error) {
      console.log("Error in getting messages from user", error);
      return NextResponse.json({ status: 400, response: error });
    }
}