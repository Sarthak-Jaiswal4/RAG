import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextRequest, NextResponse } from "next/server";
import webSearch from '../../../helper/webSearch'
import ExtractingInfo from '../../../helper/ExtractingInfo'
import querySearching from '@/lib/querySearching'

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0.1,
    streaming: true,
});

export async function POST(request: Request) {
    try {
        const { query, type, confidence, decision } = await request.json() as {
            query: string;
            type: string | undefined;
            confidence: number,
            decision: string,
        };

        if(decision=="ANSWER" && confidence>=6 && type!='Web Search' && type!='Deep Research'){
            console.log('LLM responding to query...')
            try{
            const prompt=`
            System:
              You are a knowledgeable assistant. The user’s question has already been vetted as “answerable from your own training data.”  
              Do **NOT** perform any external searches or retrievals.  
              You may include bullet points or a small table to clarify key points.
              If you’re uncertain about a fact, qualify it (e.g. “As of my last update…”).  
              Answer clearly, step by step, and provide any necessary context or caveats.
        
            user's question:${query}
            assistant:
        
            ### Requirements:
            - **Style:** Natural, conversational.
            - **Extras:** You may add a small table or a few bullet points for clarity, but keep it very brief.
        
            ### Example:
            **User:** What are the three primary colors?  
            **Assistant:** The three primary colors are red, blue, and yellow.  
            - **Primary Colors Table:**  
              | Color  | Example Use     |  
              |--------|-----------------|  
              | Red    | Stop signs      |  
              | Blue   | Skies           |  
              | Yellow | Warning labels  |
            `
            const resp=await llm.stream(prompt)
            const encoder=new TextEncoder()
            const readable=new ReadableStream({
                async start(controller) {
                    for await (const chunk of resp){
                        const content=chunk.content
                        console.log(content)
                        if(content){
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify(content)}\n\n`))
                        }
                    }   
                    controller.close()   
                },
            })
            // Stream the LLM response as a Server-Sent Event (SSE)
            return new Response(readable, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        
          } catch (error:any) {
            throw new Error("Error in just cat response",error)
          }
        }
        else{
            console.log('LLM performing web search...')
            if(type=='Deep Research'){
                try {
                    console.log("performing deep search")
                    const reQueryStr=await webSearch.QueryRewriting(query)
                    const allURLs=await webSearch.DeepSearchGetlinks(reQueryStr)
                    const saved=await ExtractingInfo.ExtractingCleanHTML(allURLs)
                    const result = await RetriveFromDb()
                    if (result instanceof Response) {
                        return result
                    }
                    if (typeof result === 'string') {
                        throw new Error(result)
                    }
                    // console.log(response)
                } catch (error:any) {
                    console.log('Error in performing deep research web search',error)
                    throw new Error(error) 
                }
            }
            try {
                console.log("performing normal search")
                const urls=await webSearch.DoWebSearch(query,type)
                const saved=await ExtractingInfo.ExtractingCleanHTML(urls)
                const result = await RetriveFromDb()
                if (result instanceof Response) {
                    return result
                }
                if (typeof result === 'string') {
                    throw new Error(result)
                }
            } catch (error:any) {
                console.log('Error in performing web search',error)
                throw new Error(error) 
            }
        }
        async function RetriveFromDb(){
            const result=await querySearching.QueryEmbedding(query,type)
            console.log(result)
            console.log("Response from api")
            
            if (!result || result.length === 0) {
                return {
                    response: { content: "I couldn't find any relevant information for your query." },
                    uniqueUrls: []
                }
            }
            
            const allUrls = result.map(chunk => chunk.metadata.url);
    
            const uniqueUrls = Array.from(new Set(allUrls));
    
            const sourceList = uniqueUrls
                .map((url, i) => `${i + 1}. ${url}`)
                .join('\n');
    
            const chunkList = result
                .map(
                    (chunk, i) =>
                        `[${i + 1}] ${chunk.densetext || chunk.sparsetext}`
                )
                .join('\n\n')
            const DeepSearchprompt = `  
                   You are an expert research assistant. Your job is to take a user's research question and a set of relevant retrieved passages (or embeddings + their corresponding text snippets), then synthesize a thorough, graduate-level research summary and analysis.
                 
                  SOURCES:
                  ${sourceList}
              
                  CONTEXT:
                  ${chunkList}
              
                  USER QUESTION:
                  “${query}”
                 
                   TASK:
                   1. **Restate the Question**  
                     Briefly rephrase the user's question in your own words to confirm understanding.
                 
                   2. **Background & Definitions**  
                     Summarize key background information and define any technical terms or theories needed.
                 
                   3. **Synthesis of Retrieved Information**  
                     - Integrate and compare the retrieved snippets.  
                     - Highlight points of agreement or conflict between sources.  
                     - Note any important data, statistics, or quotations (with in-text citations).
                 
                   4. **Critical Analysis**  
                     - Evaluate the strength and limitations of each source.  
                     - Identify gaps, open questions, or methodological issues.
                 
                   5. **Further Research Directions**  
                     - Propose at least two avenues for deeper investigation.  
                     - Suggest experiments, data you'd collect, or theoretical frameworks you'd apply.
                 
                   6. **Structured Answer**  
                     Present your findings in clearly labeled sections (e.g., Introduction, Methods, Findings, Discussion, Conclusion).
                 
                   OUTPUT FORMAT:
                   Use markdown headings, bullet lists, and numbered lists. Cite each fact or quote by referring back to "Document 1," "Document 2," etc.
                 
                   ---
                 
                   **Example (filled in)**
                 
                   **Restated Question**  
                   > How does X impact Y under condition Z?
                 
                   **Background & Definitions**  
                   > - **X**: ...  
                   > - **Y**: ...
                 
                   **Synthesis of Retrieved Information**  
                   1. **Finding A** (Doc 1): "...quote..."  
                   2. **Finding B** (Doc 2): ...
                 
                   **Critical Analysis**  
                   - Doc 1 uses small sample sizes (n=10), limiting generalizability.  
                   - Doc 2's methodology controls for...
                 
                   **Further Research Directions**  
                   - Conduct a longitudinal study tracking X and Y over 5 years.  
                   - Apply technique T from Doc 3 to measure...
                 
                   **Conclusion**  
                   > Summarize overall insights and recommended next steps.
                   `;
    
            const chatprompt = `
                You are a friendly, knowledgeable AI assistant.  Answer the user’s question in a conversational style, using the retrieved context below as your primary source.  Follow these rules:
              
              1. **Base every factual claim on the retrieved context.**  
                 - Cite each reference as “(Document 1)”, “(Document 2)”, etc., and replace those tags with the corresponding URL from the SOURCES list.
              
              2. **Supplement with your own knowledge only when appropriate.**  
                 - If the question is about general, evergreen topics (history, science fundamentals, definitions, biographies of well-known figures, etc.) and you *confidently* know additional reliable facts, you **may** add them—clearly marked with “(Model knowledge)”.  
                 - **Do not** add any supplementary information if the question concerns breaking news, ongoing events, or anything that may have changed since your last training cutoff; in those cases, rely *strictly* on the retrieved context.
              
              3. **Handle gaps gracefully.**  
                 - If the context doesn’t contain enough information and you have no safe external knowledge, respond:  
                   > “I’m sorry, I don’t have enough information here to answer that.”
              
              4. **Formatting extras:**  
                 - You may include a brief bullet list or a small table to clarify key points, but keep it very concise.
                 - At the end of your answer, always include a **TL;DR** section: a short summary in bullet points or a compact table.
              
              ---
              
              **SOURCES:**  
              ${sourceList}
              
              **CONTEXT:**  
              ${chunkList}
              
              **USER QUESTION:**  
              “${query}”
              
                `;
    
            let prompt;
            if (type != "Deep Research") {
                prompt = chatprompt;
            } else {
                prompt = DeepSearchprompt;
            }
            try {
                console.log("LLM Model is starting...");
                const response = await llm.stream(prompt);
                console.log("\n✅ Response from LLM Model:");
                console.log(response)
                const encoder = new TextEncoder();

                const readable = new ReadableStream({
                    async start(controller) {
                        for await (const chunk of response) {
                            const content = chunk.content;
                            console.log(content);
                            if (content) {
                                controller.enqueue(encoder.encode(`data: ${JSON.stringify(content)}\n\n`));
                            }
                        };
                        // controller.enqueue(encoder.encode(`list: ${JSON.stringify(uniqueUrls)}\n\n`));
                        controller.close();
                    },
                });
                // Stream the LLM response as a Server-Sent Event (SSE)
                return new Response(readable, {
                    headers: {
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        'Connection': 'keep-alive',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            } catch (error) {
                console.error("Error getting response from LLM Model:", error);
                return "Sorry, I encountered an error while trying to answer your question.";
            }
        }
        // If we reach here, something went wrong and we did not return a streamed response
        throw new Error('Failed to generate a response');

} catch (error: any) {
    console.log('Error in search API', error)
    return NextResponse.json(
        {
            error: 'Internal Server Error',
            message: (error as Error).message,
        },
        { status: 500 }
    );
}
}