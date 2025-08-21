import Bottleneck from "bottleneck";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import {Embedding} from '../helper/Helper'
import { StoreEmbedding } from "@/Database/queries";
import { contentSchema } from "@/models/content.model";
import mongoose from "mongoose";
import vectorIndexCreate from "./createIndex";
import { AddRedis } from "@/Database/cache";

const limiter = new Bottleneck({
    reservoir: 15,             // initial number of available calls
    reservoirRefreshAmount: 10,          // number of calls to restore
    reservoirRefreshInterval: 30 * 1000, // interval in ms to restore
});

async function RecursiveSplitting(context:string,sourceType:string,query?:(string | undefined),Link?:string) {
  await mongoose.connect(process.env.MONGO_URL!);
    try {
      let charsplit = new RecursiveCharacterTextSplitter({ chunkSize: 1024, chunkOverlap: 100 })
      const text = await charsplit.createDocuments([context])
      console.log(text.length)
      // const embedding=await Helper.Embedding(text)
      const embedding = await limiter.schedule(() => Embedding(text))
      const boundries=await FindSimilarChunk(embedding)
      const docs = merge(embedding, text, boundries,query,sourceType,Link)
      console.log('doc created!')
      // const StoreRedis=AddRedis(docs)
      const store=await StoreEmbedding(docs)
      // await vectorIndexCreate()
      console.log("saved successfully")
      return
    } catch (error) {
      console.log('Error in splitting docuemnt',error)
    }
}

async function FindSimilarChunk(embedding:number[][]){
    const boundries=[0]

    for(let i = 1; i < embedding.length; i++){
        // Compare current embedding with previous one
        const sim:(number | string) = dotProduct(embedding[i-1], embedding[i])
        if(typeof sim == 'number'){
            if(sim > 0.6) boundries.push(i)
        }
    }
    boundries.push(embedding.length)
    console.log('Boundries created!')

    return boundries
}

function dotProduct(arr1:number[], arr2:number[]):(number | string) {
    // Check if both inputs are arrays
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
      return "Error: Both parameters must be arrays.";
    }
  
    // Check if the arrays have the same length
    if (arr1.length !== arr2.length) {
      return "Error: Arrays must be of the same length to calculate the dot product.";
    }
  
    let product = 0;
    // Iterate through the arrays and sum the products of corresponding elements
    for (let i = 0; i < arr1.length; i++) {
      // Ensure elements are numbers for calculation
      if (typeof arr1[i] !== 'number' || typeof arr2[i] !== 'number') {
        return "Error: All elements in arrays must be numbers.";
      }
      product += arr1[i] * arr2[i];
    }
  
    return product;
}

function merge(embedding:number[][],text:any[],boundries:number[],title:string | undefined,sourceType:string,Link:string | undefined):contentSchema[]{
    const docs:contentSchema[]=[]
    const merged = text.map((doc, index) => {
        return {
          sourceType: sourceType,
          chunk_index: index,
          text:        doc.pageContent,
          embedding:   embedding[index],
          title:  title
        };
    });

    for(let i=0;i<boundries.length-1;i++){
        let startingind=boundries[i]
        let endind=boundries[i+1]-1
        for(let j=startingind;j<=endind;j++){
            const base = JSON.parse(JSON.stringify(merged[j]));
            if(sourceType=="web"){
              const doc = {
                ...base,
                metadata :{
                  web:{
                    url: Link,
                    segment:{
                      segment_id:    i,
                      segment_start: startingind,
                      segment_end:   endind,
                    },
                    fetchedAt: new Date()
                  }
                }
              };
              docs.push(doc)
            } else {
              const doc = {
                ...base,
                metadata :{
                  static:{
                    fileName:Link,
                    segment:{
                      segment_id:    i,
                      segment_start: startingind,
                      segment_end:   endind,
                    }
                  }
                }
              };
              docs.push(doc)
            }
        }
    }
    return docs
}

export default RecursiveSplitting