import jwt from 'jsonwebtoken';
import usermodel from '../Models/userModel.js'

export const userAuth=async (req,res,next)=>{
    //To send the userid to verifyotp function, we need to send the id through the token ,
    //token is there in the cookie, using a middleware, we will decode the cookie andget
    //the userid and send it  to the verifyotp function
    
    const {token}=req.cookies;

    if(!token){
        return res.status(404).json({success:false,message:'Not valid user, try again'});
    }
    try{
        //Decode the token
        let tokendecode=jwt.verify(token,process.env.JWT_SECRET);

        const user=await usermodel.findById(tokendecode.id);
        if(!user){
            return res.status(401).json({success:false,message:"User not found"});
        }
        req.user=user;

        if(tokendecode.id){ //If tokendecode has an ID property 
            if(!req.body){
                req.body={};
            }
            req.body.userid=tokendecode.id;
        } 
        else{ 
            return res.status(400).json({success:false,message:'No user id found'}); 
        }
        next();         //controller function will be executed

    }
    catch(error){
        return res.status(404).json({success:false,message:error.message});
    }
    
}


export const adminapprove=async (req,res,next)=>{
    //To send the userid to verifyotp function, we need to send the id through the token ,
    //token is there in the cookie, using a middleware, we will decode the cookie andget
    //the userid and send it  to the verifyotp function
    
    const {token}=req.cookies;

    if(!token){
        return res.status(404).json({success:false,message:'Not valid user, try again'});
    }
    try{
        //Decode the token
        let tokendecode=jwt.verify(token,process.env.JWT_SECRET);

        const user=await usermodel.findById(tokendecode.id);
        if(!user){
            return res.status(401).json({success:false,message:"User not found"});
        }
        req.user=user;

        
        next();         //controller function will be executed

    }
    catch(error){
        return res.status(404).json({success:false,message:error.message});
    }
    
}

export const requireRole=(role)=>{
    return (req,res,next)=>{
        if(!req.user || req.user.role!==role){
            return res.status(403).json({success:false,message:"Access denied"});
        }
        next();
    };
};