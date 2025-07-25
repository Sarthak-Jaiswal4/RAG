import { CohereEmbeddings } from "@langchain/cohere";

const embeddings = new CohereEmbeddings({
    apiKey: process.env.COHERE_API_KEY,
    batchSize: 48,
    model: "embed-english-v3.0",
});

function QueryCreator(query:string){
    return String(query).replace(/ /g, "+")
}

async function Embedding(context: any[]):Promise<number[][]>{
    console.log("Embedding starts.....")
    const texts = context.map((doc: any) => doc.pageContent);
    const documentRes = await embeddings.embedDocuments(texts);
    console.log("Embedding finished.....")
    return documentRes 
}

async function TitleExtractor(query: string) {
    let title = query.trim();
    
    const prefixesToRemove = [
        'what is', 'who is', 'how to', 'when is', 'where is', 'why is',
        'tell me about', 'explain', 'describe', 'show me', 'find', 'search for'
    ];
    
    for (const prefix of prefixesToRemove) {
        if (title.toLowerCase().startsWith(prefix.toLowerCase())) {
            title = title.substring(prefix.length).trim();
            break;
        }
    }
    
    // Capitalize first letter and limit length
    if (title.length > 0) {
        title = title.charAt(0).toUpperCase() + title.slice(1);
        
        // Limit title length to reasonable size
        if (title.length > 40) {
            title = title.substring(0, 30) + '...';
        }
    }
    
    // If title is empty after processing, use a default
    if (!title) {
        title = 'Untitled Query';
    }
    
    return title;
}


export default {QueryCreator,Embedding,TitleExtractor}