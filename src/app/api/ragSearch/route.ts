import { NextResponse } from "next/server"
import PDFQueryEmbedding from '../../../lib/querySearching'
import { getName } from "@/helper/Helper"

export async function POST(request:Request){
    try {
        const {query,PDFs}=await request.json() as {
            query:string,
            PDFs:string[]
        }
        console.log(query,PDFs)
        if(!query || !PDFs){
            return NextResponse.json({status:401,message:"Parameters missing"})
        }
        const fullpath=await getName(PDFs)
        console.log(fullpath)
        const ragsearch:any=await PDFQueryEmbedding.PDFQueryEmbedding(query,fullpath)
        if(ragsearch){
            console.log(ragsearch?.response?.content)
            const answer=ragsearch?.response?.content
            const sourceList=ragsearch.uniqueFileNames
            return NextResponse.json({status:200,message:"successful",answer:answer,sourceList:sourceList})
        }

        return NextResponse.json({status:404,message:"Something went wrong"})

    } catch (error:any) {
        console.log('Error in RAGsearch API',error)
        return NextResponse.json({
            status:500,
            message:"Something went wrong in API"
        })
    }
}