'use server'
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
});

export async function UploadS3(file:File,filename:string){
    console.log("s3 bucket",file,filename)
    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const putObjectCommand = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET, 
            Key: filename,
            Body: buffer,
            ContentType: "application/pdf",
        });
        const upload=await s3.send(putObjectCommand)
        console.log(upload)
        return upload
    } catch (error) {
        console.log('Error in uploading to s3',error)
    }
}