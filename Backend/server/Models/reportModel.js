import mongoose from "mongoose";

const reportSchema=new mongoose.Schema({
    reportedBy:{type:mongoose.Schema.Types.ObjectId,ref:"user",required:true},
    reportType:{type:String,enum:["url","email","phone"],required:true},
    content:{type:String,required:true,trim:true},
    description:{type:String,required:true,trim:true},
    status:{type:String,enum:["pending","under-review","safe","phishing"],default:"pending"},
    reviewedBy:{type:mongoose.Schema.Types.ObjectId,ref:"user",default:null},
    reviewedAt:{type:Date,default:null},
    adminRemarks:{type:String,default:""},
    detectionResult:{isPhishing:{type:Boolean,default:false},riskScore:{type:Number,default:0},matchedRules:[String]}

},{timestamps:true});

const reportModel=mongoose.model("report",reportSchema);
export default reportModel;