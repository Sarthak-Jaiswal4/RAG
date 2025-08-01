import {SearchRedis} from "@/Database/cache";
import contentModel from "@/models/content.model";
import { CohereEmbeddings } from "@langchain/cohere";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import mongoose from "mongoose";

const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERE_API_KEY,
  batchSize: 48,
  model: "embed-english-v3.0",
});

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  // baseUrl:     "http://localhost:11434",
  temperature: 0.1,
});

async function QueryEmbedding(query: string,type?:string): Promise<string | undefined> {
  try {
    const densequeryembedding = await embeddings.embedQuery(query);
    // const RedisSearch= SearchRedis(densequeryembedding)
    const dembedding = await DenseRetrieveQuery(densequeryembedding, query,type);
    const sembedding = await SparseRetrieveQuery(query,type);
    const result = await mergeRetrieval(dembedding, sembedding);
    console.log(result)
    const answer = await answerwithollama(query, result,type);
    return answer;
  } catch (error) {
    console.log("error in querying", error);
  }
}

async function DenseRetrieveQuery(queryembedding: number[],userquery: string,type?:string): Promise<any[]> {
  console.log('searching for dense vector')
  let results: any[] = [];
  try {
    await mongoose.connect(process.env.MONGO_URL!);
    const collection = contentModel.collection;
    const pipeline = [
      {
        $vectorSearch: {
          index: "dense_embedding",
          queryVector: queryembedding,
          path: "embedding",
          numCandidates: 100,
          limit: type==="Deep Research"? 18 : 10,
          similarityMetric: "cosine",
        },
      },
      {
        $project: {
          _id: 0,
          text: "$text",
          chunk_index: "$chunk_index",
          metadata: "$metadata",
          score: { $meta: "vectorSearchScore" },
        },
      },
    ];
    const cursor = collection.aggregate(pipeline);
    results = await cursor.toArray();

    console.log("Found documents:");
    return results;
  } catch (error) {
    console.log("Error in finding query", error);
    return [];
  }
}

async function SparseRetrieveQuery(userquery: string,type?:string): Promise<any[]> {
  console.log('searching for sparse vector')
  let results: any[] = [];
  try {
    await mongoose.connect(process.env.MONGO_URL!);
    const collection = contentModel.collection;
    const pipeline = [
      {
        $search: {
          index: "sparse_embedding",
          text: {
            query: userquery,
            path: "text",
          },
        },
      },
      {
        $limit: type==="Deep Research"? 18: 8,
      },
      {
        $project: {
          _id: 0,
          text: "$text",
          chunk_index: "$chunk_index",
          metadata: "$metadata",
          score: { $meta: "searchScore" },
        },
      },
    ];
    const cursor = collection.aggregate(pipeline);
    results = await cursor.toArray();

    console.log("Found documents:");
    return results;
  } catch (error) {
    console.log("Error in finding sparse query", error);
    return [];
  }
}

async function mergeRetrieval(dembedding: any[],sembedding: any[]): Promise<any[]> {
  const chunkids = new Set();
  const result: any[] = [];
  dembedding.forEach((doc, i) => {
    let score: number;
    const chunkid = doc.chunk_index;
    let sparse_embedding = sembedding.findIndex(
      (id) => id.chunk_index == chunkid
    );
    if (sparse_embedding != -1 || !sparse_embedding) {
      score = 1 / (i + 1) + 1 / (sparse_embedding + 1);
      result.push({
        denseembedding: doc.score,
        sparseembedding: sembedding[sparse_embedding]?.score,
        score: score,
        chunkid,
        densetext: doc.text,
        sparsetext: sembedding[sparse_embedding]?.text?.pageContent || "null",
        metadata: doc.metadata.web
      });
    } else {
      score = 1 / (i + 1);
      result.push({
        denseembedding: doc.score,
        sparseembedding: sembedding[sparse_embedding]?.score || "null",
        score: score,
        chunkid,
        densetext: doc.text,
        sparsetext: "null",
        metadata: doc.metadata.web
      });
    }
    chunkids.add(chunkid);
  });
  sembedding.forEach((doc, i) => {
    if (!chunkids.has(doc.chunk_index)) {
      const score = 1 / (i + 1);
      result.push({
        denseembedding: "null",
        sparseembedding: doc.score,
        score: score,
        chunkid: doc.chunk_index,
        densetext: "null",
        sparsetext: doc?.text || "null",
        metadata: doc.metadata.web
      });
    }
  });
  result.sort((a, b) => b.score - a.score).slice(0, 8);
  return result;
}

async function answerwithollama(userquery: string,result: any[],type?:string): Promise<any> {

  const sourceList = result
  .map((chunk, i) => `${i + 1}. ${chunk.metadata.url}`)
  .join('\n')

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
    “${userquery}”
   
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
  You are a friendly, knowledgeable AI assistant. Use only the retrieved context below to answer the user’s question in a conversational style, providing a thorough yet concise explanation. You may include bullet points or a small table to clarify key points. Cite any references to the context with “(Document 1)”, “(Doc 2)”, etc. If the context doesn’t contain enough information, respond: “I’m sorry, I don’t have enough information here to answer that.”

    SOURCES:
    ${sourceList}

    CONTEXT:
    ${chunkList}

    USER QUESTION:
    “${userquery}”

   ### Requirements:
    - **Style:** Natural, conversational.
    - **Extras:** You may add a small table or a few bullet points for clarity, but keep it very brief.
    - Citations: Whenever you reference a chunk, append its URL in brackets.  
      For example: “They increased security levels after the conflict [1].”  
      The model should then substitute “[1]” with “[https://…]” from the SOURCES list above.

    ### Example:
    **User:** What are the three primary colors?  
    **Assistant:** The three primary colors are red, blue, and yellow.  
    - **Primary Colors Table:**  
      | Color  | Example Use     |  
      |--------|-----------------|  
      | Red    | Stop signs      |  
      | Blue   | Skies           |  
      | Yellow | Warning labels  |
  `;

  let prompt;
  if (type !="Deep Research") {
    prompt = chatprompt;
  } else {
    prompt = DeepSearchprompt;
  }
  try {
    console.log("LLM Model is starting...");
    const response = await llm.invoke(prompt);
    console.log("\n✅ Response from LLM Model:");
    console.log(response.response_metadata);
    console.log(response.content);
    return response.content;
  } catch (error) {
    console.error("Error getting response from LLM Model:", error);
    return "Sorry, I encountered an error while trying to answer your question.";
  }
}

export default { QueryEmbedding };
