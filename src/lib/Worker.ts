'use server'
import axios from 'axios';
import {Job, Worker} from 'bullmq'

const worker=new Worker('chatUploadQueue',async(job)=>{
    console.log("Worker recieves",job.id)
    try {
        const response = await axios.post(`${process.env.NEXTAUTH_URL}/api/updatemessageandmemory  || http://localhost:3000/api/updatemessageandmemory`, {
          role:job.data.role,
          content:job.data.content,
          sessionname:job.data.sessionname,
          sourceList:job.data.sourceList
        },{
            headers: {
              Cookie: `authjs.session-token=${job.data.authToken.value}`
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
    connection: {
      host: '13.235.69.247',
      port: 6379,
    },
    removeOnComplete: {
        age: 3600, // keep up to 1 hour
        count: 50, // keep up to 1000 jobs
    },
})
