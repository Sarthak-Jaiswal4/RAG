'use server'
import "dotenv/config"
import axios from 'axios';
import {Job, Worker} from 'bullmq'
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {Embedding} from '../helper/Helper'
import { CohereEmbeddings } from '@langchain/cohere';
import { StoreEmbedding } from "@/Database/queries";
import { ContentData } from "@/types/contenttype";
import path from "path";
import { writeFile } from "fs/promises";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERE_API_KEY,
  batchSize: 48,
  model: "embed-english-v3.0",
});

const chatworker=new Worker('chatUploadQueue',async(job)=>{
    console.log("Worker recieves",job.id,job.data)
    try {
        const response = await axios.post(`http://localhost:3000/api/updatemessageandmemory`, {
          role:job.data.role,
          content:job.data.content,
          sessionname:job.data.sessionname,
          sourceList:job.data.sourceList
        },{
            headers: {
              Cookie:`authjs.session-token=${job.data.authjs_session_token.value}; authjs.csrf-token=${job.data.authjs_csrf_token.value}; authjs.callback-url=${job.data.authjs_callback_url.value}`
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
      host: '3.110.167.39',
      port: 6379,
    },
    removeOnComplete: {
        age: 3600, // keep up to 1 hour
        count: 50, // keep up to 1000 jobs
    },
})

const fileworker=new Worker('fileuploadqueue',async(job)=>{
  console.log('Worker',job.data)
  const filename=job.data.filename

  const getfilefroms3=new GetObjectCommand({
    Bucket:process.env.AWS_BUCKET,
    Key:filename
  })

  const response:any = await s3.send(getfilefroms3);
  console.log(response.$metadata.httpStatusCode)
  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  await writeFile(
      path.join(process.cwd(), "public/assets/" + filename),
      buffer
  );

  const loader = new PDFLoader(`public/assets/${job.data.filename}`);
  const docs = await loader.load();
  console.log(docs.length)

  const embedding=await Embedding(docs)

  const document: ContentData[]=[]
  console.log(docs[2].metadata)
  
  for(let i =0;i<docs.length;i++){
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
    host: '3.110.167.39',
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
  console.log(`✅ Job ${job.id} completed with result`);
});

fileworker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed with data:`, job?.data);
  console.error("Error:", err);
});

fileworker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed with result`);
});
