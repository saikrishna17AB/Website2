import mongoose from "mongoose";
import validator from "validator";
const userSchema=new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true,validate:[validator.isEmail,'Invalid email format']},
    password:{type:String,required:true},
    verifyOtp:{type:String,default:''},
    verifyOtpExpireAt:{type:Number,default:0},
    isAccountVerified:{type:Boolean,default:false},
    resetOtp:{type:String,default:''},
    resetOtpExpireAt:{type:Number,default:0},
    role:{type:String,enum:['user','admin','superadmin'],default:'user',required:true},
    adminRequest:{type:Boolean,default:false},
    isSuspended:{type:Boolean,default:false}

},{timestamps:true});

const userModel=mongoose.models.user || mongoose.model('user',userSchema);
export default userModel;
