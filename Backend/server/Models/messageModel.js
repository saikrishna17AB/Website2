import mongoose from "mongoose";

const messageSchema=new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId,ref:"User"},
    name: String,
    role: String,
    text: String,

},{timestamps:true});

const Message=mongoose.model("Message",messageSchema);
export default Message;