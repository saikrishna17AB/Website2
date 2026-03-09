import mongoose from "mongoose";

const reportSchema=new mongoose.Schema({
    reportedBy:{type:mongoose.Schema.Types.ObjectId,ref:"user",required:true},
    reportType:{type:String,enum:["url","email"],required:true},
    content:{type:String,required:true,trim:true},
    description:{type:String,required:true,trim:true},
    status:{type:String,enum:["pending","under-review","safe","phishing"],default:"pending"},
    reviewedBy:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    reviewedAt:{type:Date,required:true},
    adminRemarks:{type:String,required:true},
    detectionResult:{isPhishing:Boolean,riskScore:Number,matchedRules:[String]}

},{timestamps:true});

const reportModel=mongoose.model("report",reportSchema);
export default reportModel;