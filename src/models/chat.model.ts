import mongoose,{Document,Schema} from "mongoose";
import userModel, { User } from "./user.model";
import messageModel, { Messageschema, MessageSchema } from "./message.model";
import memoryModel, { Memoryschema, MemorySchema } from "./memory.model";

export interface ChatSession extends Document {
    createdAt?:Date,
    userid:mongoose.Types.ObjectId,
    sessionname:string,
    messages:MessageSchema[],
    memories:MemorySchema[],
    updatedAt?:Date
}

const chatsession:Schema<ChatSession>=new Schema({
    userid:{ type: Schema.Types.ObjectId, ref: "User", required: true },
    sessionname:{
        type:String,
        required:[true,'chat session name is required']
    },
    messages:[Messageschema],
    memories:[Memoryschema],
    createdAt:{
        type:Date,
        default:Date.now()
    },
    updatedAt:{
        type:Date,
        default:Date.now()
    }
})

chatsession.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const chatSessionModel=(mongoose.models.chatsession as mongoose.Model<ChatSession>)||(mongoose.model<ChatSession>("chatsession",chatsession))
export default chatSessionModel