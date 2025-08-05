import DBconnection from "@/lib/Connection";
import chatSessionModel, { ChatSession } from "@/models/chat.model"
import contentModel, { contentSchema } from "@/models/content.model"
import memoryModel from "@/models/memory.model"
import userModel from "@/models/user.model";

await DBconnection()
export const StoringChatSession=async(data:any)=>{
    try {
        const response=await chatSessionModel.create({
            userid:data.userid,
            sessionname:data.sessionname,
            messages:[],
            memories:[]
        }).then((res)=>{
            return res
        }).catch((err)=>{
            console.log(err)
            throw new Error('Error in storemebdding function',err)
        })
        return response
    } catch (error:any) {
        console.log('Error in Storeing embedding in Database',error)
        throw new Error(error)
    }
}

export const StoreEmbedding=async(data:contentSchema[])=>{
    try {
        const response=await contentModel.insertMany(
            data
        ).then((res)=>{

            return 
        }).catch((err)=>{
            console.log('Error in storing embedding in mongoDB in queries.ts',err)
            throw new Error('Error in storemebdding function',err)
        })
    } catch (error:any) {
        console.log('Error in Storing embedding in Database',error)
        throw new Error(error)
    }
}

export const UpdateUserMessage = async (userid: any,sessionname:string, message: { role: string, content: string, sourceList?:string[] ,timestamp?: Date }): Promise<any> => {
    try {
        const response=await chatSessionModel.findByIdAndUpdate(
            sessionname
        ,{
            $push: {
                messages: {
                  role: message.role,
                  content: message.content,
                  sourceList: message?.sourceList,
                  timestamp: message.timestamp ?? new Date(),
                }
              }
        },{
            new: true, upsert: false 
        })
        return response 
    } catch (error:any) {
        console.log('Error in Storeing embedding in Database',error)
        throw new Error(error)
    }
}

export const UpdateMemory = async (userid: string, memory: { memoryText: string, embedding: string, createdAt?: Date }): Promise<void> => {
    try {
        const response=await chatSessionModel.findByIdAndUpdate({
            userid
        },{
            $push: {
                memories: {
                  memoryText: memory.memoryText,
                  embedding: memory.embedding,
                  createdAt: memory.createdAt ?? new Date()
                }
              }
        },{
            new: true, upsert: false 
        }).then((res)=>{
            console.log(res)
            return 
        }).catch((err)=>{
            console.log(err)
            throw new Error('Error in storemebdding function',err)
        })
    } catch (error:any) {
        console.log('Error in Storeing embedding in Database',error)
        throw new Error(error)
    }
}

export const GetMessages=async(chatsessionid:string)=>{
    try {   
        
        const messages=await chatSessionModel.findById(chatsessionid)
        return messages

    } catch (error:any) {
        console.log('Error in getting message from mongodb',error)
        throw new Error(error) 
    }
}

export const Deletechat=async(chatid:string)=>{
    try{
        const response=await chatSessionModel.findByIdAndDelete(chatid)
        return response
    }catch(error:any){
        console.log('Error in deleting chat from mongodb',error)
        throw new Error(error)
    }
}

export const createuserViaGoogle=async(name:string,email:string,email_verified:boolean)=>{
    try {
        console.log(name,email,email_verified)
        const user=await userModel.create({
            username:name,
            email,
            isverified:email_verified
        })
        console.log(user)
        if(!user){
            throw new Error('Error in creating google new user in database')
        }
        return user
    } catch (error) {
        console.log('Error in creating Google user in Database',error)
        throw new Error('Error in storing new Google user in database')
    }
}
