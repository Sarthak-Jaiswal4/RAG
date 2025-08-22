'use server'
import "dotenv/config"
import axios from 'axios';
import {Job, Worker} from 'bullmq'
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {Embedding} from '../helper/Helper'
import { CohereEmbeddings } from '@langchain/cohere';
import { StoreEmbedding } from "@/Database/queries";
import { ContentData } from "@/types/contenttype";

const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERE_API_KEY,
  batchSize: 48,
  model: "embed-english-v3.0",
});

const chatworker=new Worker('chatUploadQueue',async(job)=>{
    console.log("Worker recieves",job.id)
    try {
        const response = await axios.post(`https://rag-xi-peach.vercel.app/api/updatemessageandmemory`, {
          role:job.data.role,
          content:job.data.content,
          sessionname:job.data.sessionname,
          sourceList:job.data.sourceList
        },{
            headers: {
              Cookie: `__Secure-authjs.session-token=${job.data.authToken.value}`
            }
        });

        console.log(response.data)
        if (response.data.status!=200) {
          console.error(response.data.response)
          throw new Error('Failed to update message and memory');
        }
        if (response.data.status===200) {
          console.log('message uploaded successfully')
        }
        return
      } catch (error) {
        console.error('Error uploading message and memory:', error);
        throw error;
      }

},{
    concurrency: 50,
    connection: {
      host: '65.0.30.180',
      port: 6379,
    },
    removeOnComplete: {
        age: 3600, // keep up to 1 hour
        count: 50, // keep up to 1000 jobs
    },
})

const fileworker=new Worker('fileuploadqueue',async(job)=>{
  console.log('Worker',job.data)
  const loader = new PDFLoader(`public/assets/${job.data.filename}`);
  const docs = await loader.load();
  console.log(docs.length)
  const embedding=await Embedding(docs)
  const document: ContentData[]=[]
  for(let i =0;i<docs.length;i++){
    console.log(docs[i].metadata)
    let result: ContentData={
      sourceType:'static',
      text:docs[i].pageContent,
      embedding:embedding[i],
      metadata:{
        static: {
          fileName:docs[i].metadata.source as string,
          pageNumber:docs[i].metadata.loc.pageNumber as number
        }
      },
    }
    document.push(result)
  }

  const store=await StoreEmbedding(document)
  console.log("saved successfully")
},{
  connection: {
    host: '65.0.30.180',
    port: 6379,
  },
  removeOnComplete: {
      age: 3600, // keep up to 1 hour
      count: 50, // keep up to 1000 jobs
  },
})

chatworker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed with data:`, job?.data);
  console.error("Error:", err);
});

chatworker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed with result:`, job.returnvalue);
});

fileworker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed with data:`, job?.data);
  console.error("Error:", err);
});

fileworker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed with result:`, job.returnvalue);
});
