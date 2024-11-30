import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'conversation',
        required:true
    },
    sender : {
        type: mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    content : {
        type: String,
        required:true
    }
},{
    timestamps:true
})

const message = mongoose.model("messages",messageSchema)

export default message