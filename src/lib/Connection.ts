import mongoose from 'mongoose'

type connectionObject={
    isconnect?:number
}

const mongoURL:(string)=process.env.MONGO_URL || ""

if(!mongoURL){
    console.log('Please define the mongoDB URL')
    throw new Error('Please define the mongoDB URL')
}

const connection:connectionObject={}

async function DBconnection():Promise<void>{
    if(connection.isconnect){
        console.log('already connected to DB')
        return 
    }
    try {
        const db=await mongoose.connect(mongoURL)
        connection.isconnect=db.connections[0].readyState
        console.log('connected to database')
    } catch (error) {
        console.log(error)
        throw new Error('Connecting to mongodb')
    }
}

export default DBconnection