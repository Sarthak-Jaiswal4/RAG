import mongoose from 'mongoose'

type connectionObject={
    isconnect?:number
}

const mongoURL:(string)=process.env.MONGO_URL || ""

if(!mongoURL){
    console.log('Warning: MONGO_URL is not set. Database operations will fail.')
}

const connection:connectionObject={}

async function DBconnection():Promise<void>{
    if(connection.isconnect){
        console.log('already connected to DB')
        return 
    }
    
    if (!mongoURL) {
        console.log('Cannot connect to database: MONGO_URL is not set')
        return
    }
    
    try {
        const db=await mongoose.connect(mongoURL)
        connection.isconnect=db.connections[0].readyState
        console.log('connected to database')
    } catch (error) {
        console.log('Database connection error:', error)
        // Don't throw error, just log it to prevent server crashes
    }
}

export default DBconnection