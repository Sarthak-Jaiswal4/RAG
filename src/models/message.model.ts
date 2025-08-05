import mongoose,{Document,Schema} from "mongoose";

export type MessageRole = 'user' | 'assistant' | 'system';
export interface MessageSchema extends Document{
    role:MessageRole ,
    content:string,
    sourceList?:string[],
    timestamp:Date,
}

export const Messageschema = new Schema<MessageSchema> ({
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: false
    },
    sourceList:{
      type: [String],
      required: false,
      default:[]
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
  }, { _id: false });

  const Messagemodel=(mongoose.models.messagemodel as mongoose.Model<MessageSchema>)||(mongoose.model("messagemodel",Messageschema))
  export default Messagemodel