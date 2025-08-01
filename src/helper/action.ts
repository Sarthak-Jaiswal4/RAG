import webSearch from './webSearch'
import ExtractingInfo from './ExtractingInfo'
import querySearching from '@/lib/querySearching'

interface QueryAnalysis {
    original: string;
    paraphrases: string[];
    sub_questions: string[];
    broader_related: string[];
}

export const shoudldosearch=async(query:string)=>{
    const resp=await webSearch.ShouldSearch(query)
    return resp
}

export const DoWebSearch=async(decision:string,confidence:number,query:string,type?:string)=>{
    try {
        if(decision=="ANSWER" && confidence>=6 && type!='Web Search' && type!='Deep Research'){
            console.log('LLM responding to query...')
            const resp=await webSearch.DoChat(query)
            console.log(resp)
            return resp
        }
        else{
            console.log('LLM performing web search...')
            if(type=='Deep Research'){
                try {
                    console.log("performing deep search")
                    const reQueryStr=await webSearch.QueryRewriting(query)
                    const allURLs=await webSearch.DeepSearchGetlinks(reQueryStr)
                    const saved=await ExtractingInfo.ExtractingCleanHTML(allURLs)
                    const response= await RetriveFromDb(query,type)
                    // console.log(response)
                    return response 
                } catch (error:any) {
                    console.log('Error in performing deep research web search',error)
                    throw new Error(error) 
                }
            }
            try {
                console.log("performing normal search")
                const urls=await webSearch.DoWebSearch(query,type)
                const saved=await ExtractingInfo.ExtractingCleanHTML(urls)
                const response= await RetriveFromDb(query,type)
                // console.log(response)
                return response 
            } catch (error:any) {
                console.log('Error in performing web search',error)
                throw new Error(error) 
            }
        }
    } catch (error:any) {
        throw new Error('Error in Web search action',error)
    }
}

export const RetriveFromDb=async(query:string,type?:string)=>{
    try {
        const reponse=await querySearching.QueryEmbedding(query,type)
        if(reponse){
            return reponse
        }
    } catch (error:any) {
    throw new Error('Error in Retrieval from DB', error)
    }
}