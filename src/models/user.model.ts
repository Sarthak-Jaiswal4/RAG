import mongoose,{Schema,Document} from "mongoose";
import chatSessionModel, { ChatSession } from "./chat.model";
import { string } from "zod";

export interface User extends Document {
    username:string,
    email:string,
    password?:string,
    chats:ChatSession[],
    profilepic?:string,
    isverified:boolean,
    verificationcode:string,
    ExpiryTime:Date
    // id?:string
}

const UserSchema:Schema<User>=new Schema ({
    // id:{
    //     type:String,
    //     required:[true,'id is required']
    // },
    username:{
        type:String,
        required:[true,'username is required'],
    },
    email:{
        type:String,
        required:[true,'email is required'],
        // unique:true,
        match:[/.+\@.+\..+/,"please use a valid email address"]
    },
    password:{
        type:String,
        // required:[true,'password is required']
    },
    isverified:{
        type:Boolean,
        default:false,
    },
    verificationcode:{
        type:String,
    },
    ExpiryTime:{
        type: Date
    },
    chats: [{ type: Schema.Types.ObjectId, ref: "chatsession", default: [] }]
})

const userModel=(mongoose.models.User as mongoose.Model<User>)||(mongoose.model<User>("User",UserSchema))
export default userModel