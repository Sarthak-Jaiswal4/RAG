import axios from "axios";
import Helper from "./Helper";
import { URLArray } from "./ExtractingInfo";
import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0.1,
});

console.log(process.env.GOOGLE_API_KEY);

interface QueryAnalysis {
  original: string;
  paraphrases: string[];
  sub_questions: string[];
  broader_related: string[];
}

interface Joke {
  decision:string,
  confidence:number
}

async function ShouldSearch(query: string) {
  const formatInstructions =
  "Respond with a valid JSON object, containing two fields: 'decision' and 'confidence'.";
  const parser = new JsonOutputParser<Joke>();
  const prompt = ChatPromptTemplate.fromTemplate( `
    You are a meta‑assistant whose sole job is to decide, for any incoming user query, whether the downstream pipeline should:
  • [SEARCH] — perform a web/external-document retrieval step first, or
  • [ANSWER] — answer purely from your own internal knowledge.

    Then you must rate your confidence in that decision on a scale from 1 (very uncertain) to 10 (absolutely certain).
    query : ${query}
    \n{format_instructions}
    `);
    try {
        console.log("LLM should search or not...");
        const partialedPrompt = await prompt.partial({
          format_instructions: formatInstructions,
        });
        
        const chain = partialedPrompt.pipe(llm).pipe(parser);
        
        const response=await chain.invoke({ query: query });
        return response
    } catch (error:any) {
        console.log(error)
        throw new Error('Error in ShouldSearch function',error)
    }
}

async function DoWebSearch(query: string,type?:string) {
  const newquery = Helper.QueryCreator(query);
  console.log(newquery);
  try {
    const urls: URLArray[] = [];
    const res = await axios.get(
<<<<<<< HEAD
      `${process.env.EC2_IP}:8181/search?q=${newquery}&format=json`
=======
      `http://3.110.167.39:8181/search?q=${newquery}&format=json`
>>>>>>> 0de89717ab22d867222ac2e1fef8b79411a7829e
    );

    // Limit to 5 websites only
    const num:number = type != 'Deep Research' ? 6 : 10
    res.data.results.slice(0, num).forEach((element: any) => {
      urls.push({ link: element.url, visited: false, title: query });
    });

    console.log("Finished searching!",urls);
    return urls;
  } catch (error) {
    console.log("Error while searching", error);
    throw new Error("Error while searching through web");
  }
}

async function QueryRewriting(query: string) {
  const formatInstructions =
  "Respond with a valid JSON object, containing four fields: 'original','paraphrases','sub_questions' and 'broader_related'.";
  const parser = new JsonOutputParser<QueryAnalysis>();
  const prompt =ChatPromptTemplate.fromTemplate( `
    You are a query‐expansion assistant. Given an original user question, generate:
    1. Five paraphrased versions that use synonyms or reordered structure.
    2. Three narrower sub‑questions digging into specific facets.
    3. Two broader or related questions that place the topic in context.
     query : ${query}
    \n{format_instructions}
    `);
  try {
    console.log("LLM QueryRewriting...");
    const partialedPrompt = await prompt.partial({
      format_instructions: formatInstructions,
    });
    
    const chain = partialedPrompt.pipe(llm).pipe(parser);
    const response=await chain.invoke({ query: query });
    return response
  } catch (error) {
    console.error("Error getting Rewriting query from Ollama:", error);
    throw new Error("Error getting Rewriting query from Ollama");
  }
}

async function DeepSearchGetlinks(deepsearchquery: QueryAnalysis):Promise<URLArray[]> {
  const URLS:Set<URLArray> = new Set();
  const OriginalLinks = await DoWebSearch(deepsearchquery.original);

  // Add original links
  OriginalLinks.forEach((link) => {
    URLS.add(link);
  });
  console.log(URLS);

  // Add sub-questions links
  for (const sub of deepsearchquery.sub_questions) {
    const links = await DoWebSearch(sub);
    for (const link of links) {
      URLS.add(link);
    }
  }
  console.log(URLS);

  // Add broader related links
  for (const sub of deepsearchquery.broader_related) {
    const links = await DoWebSearch(sub);
    for (const link of links) {
      URLS.add(link);
    }
  }
  console.log(URLS);

  // Add paraphrases links (use each paraphrase individually, not concatenated)
  for (const paraphrase of deepsearchquery.paraphrases) {
    console.log("Searching for paraphrase:", paraphrase);
    const query = deepsearchquery.original + " " + paraphrase;
    const links = await DoWebSearch(query);
    for (const link of links) {
      URLS.add(link);
    }
  }
  console.log(URLS);
  return Array.from(URLS);
}

async function DoChat(query:string){
  try {
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
    const resp=await llm.invoke(prompt)
    return resp.content

  } catch (error:any) {
    throw new Error("Error in just cat response",error)
  }
}

export default { DoWebSearch, QueryRewriting, DeepSearchGetlinks, ShouldSearch, DoChat };