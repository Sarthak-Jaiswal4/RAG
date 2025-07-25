import mongoose,{Document,Schema} from "mongoose";

export interface MemorySchema extends Document{
    memoryText:string ,
    embedding:number[],
    createdAt:Date,
}

export const Memoryschema = new Schema<MemorySchema> ({
      memoryText: {
        type: String,
        required: true
      },
      embedding: {
        type: [Number],
        default: []
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
  }, { _id: false });

  const memoryModel=(mongoose.models.memoryModel as mongoose.Model<MemorySchema>)||(mongoose.model("memoryModel",Memoryschema))
  export default memoryModel