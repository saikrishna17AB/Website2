import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import usermodel from '../Models/userModel.js'
import validator from 'validator';
import transporter from '../config/nodemailer.js';

export const register= async (req,res)=>{
    let {name,email,password}=req.body;

    
    if(!name || !email || !password){
        return res.json({success:false,message:'Missing details'});
    }

    if(!validator.isEmail(email)){
        return res.status(404).json({success:false,message:'Invalid Email'});
    }
    email=email.toLowerCase().trim();

    try{

        //Checking if the email given is already present in the database or not
        const existingUser=await usermodel.findOne({email});
        if(existingUser){
            return res.json({success:false,message:'Email ID already exists'});
        }

        //Hash the password
        const hashedpassword=await bcrypt.hash(password,10);

        //Create the user
        const user=new usermodel({name,email,password:hashedpassword});
        await user.save(); 

        //Create the jwt token
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'2d'});
        //Now send the token  through cookie

        res.cookie('token',token,{      
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',        
            
            //If the environment is production then secure will be set to https otherwise http when running on local environment

            sameSite:process.env.NODE_ENV==='production'?'none':'strict',
            maxAge:60*60*1000        //7 days of expiry date of cookie

        })

        //Sending welcome email

        const mailoptions={
            from:process.env.SENDER_MAIL,
            to:user.email,
            subject:'Welcome to website',
            text: `Welcome to website , account has been created successfully . Email id: ${email}`
        };

        // await transporter.sendMail(mailoptions);
        res.json({success:true,message:'Registered successfully'});
    }
    catch(error){
        res.json({success:false,message:error.message});
    }
}

export const login=async (req,res)=>{
    let {email,password,role}=req.body;
    
      


    
    if(!email || !password || !role){
        return res.json({success:false,message:'Missing details'})
    }
    if(!validator.isEmail(email)){
        return res.status(404).json({success:false,message:'Invalid email'})
    }
    email=email.toLowerCase().trim();
    try{
        const existingUser=await usermodel.findOne({email});
        if(!existingUser){
            return res.json({success:false,message:'Invalid Email'});
        }
        if (existingUser.isSuspended===true) {
            return res.status(403).json({
                success: false,
                message: "Account suspended. Contact admin."
            });
        }   
        
        if (role==="admin" && role !== existingUser.role) {
            return res.status(403).json({
                success: false,
                message: "Access denied: Wrong role selected"
            });
        }

        if (role==="superadmin" && role !== existingUser.role) {
            return res.status(403).json({
                success: false,
                message: "Access denied: Wrong role selected"
            });
        }

        
        //Compare the password given with that stored in database
        const ismatch=await bcrypt.compare(password,existingUser.password);
        if(!ismatch){
            return res.status(400).json({success:false,message:'Password not matched'});
        }

        //If successful login , generate and send token

        const token=jwt.sign({id:existingUser._id},process.env.JWT_SECRET,{expiresIn:'2d'});
        
        res.cookie('token',token,{
            httpOnly:true,
            secure:false,
            sameSite:"lax",
            // secure:process.env.NODE_ENV === "production",
            // sameSite:process.env.NODE_ENV==='production'?'none':'strict',
            maxAge:60*60*1000      

        })
        return res.status(200).json({success:true,message:'Logged in successfully',
            role:existingUser.role
        });
        
    }
    catch(error){
        res.json({success:false,message:error.message});
    }
}

export const logout =async (req,res)=>{
    try{
        //To Logout , we just need to clear the cookie from the browser
        res.clearCookie('token',{
             httpOnly:true,
            // secure:process.env.NODE_ENV === "production",
            // sameSite:process.env.NODE_ENV==='production'?'none':'strict',
            secure:false,
            sameSite:"lax",
            
        });

        return res.status(200).json({success:true,message:'Logged out successfully'});
    }
    catch(error){
        return res.status(404).json({success:false,message:error.message});
    }
}

//Sending verification OTP to user's email
export const sendotp=async (req,res)=>{
    try{
        const {userid}=req.body;
        const user=await usermodel.findById(userid);

        if(user.isAccountVerified){
            return res.status(200).json({success:false,message:'Account is already verified'});
        }

        //If not verified generate the otp
        
        const otp=String(Math.floor(100000+Math.random()*900000));
        
        user.verifyOtp=otp;
        user.verifyOtpExpireAt=Date.now() + 300*1000;

        await user.save();

        const mailoptions={
            from:process.env.SENDER_MAIL,
            to:user.email,
            subject:'Account verification OTP',
            text:`Your verification OTP is ${otp} , this OTP must be used within 5 minutes`
        }
        
        // await transporter.sendMail(mailoptions);

        res.status(200).json({success:true,message:'Verification OTP sent at email'});

    }
    catch(error){
        return res.status(404).json({success:false,message:error.message});
    }
}

export const verifyemail=async (req,res)=>{
    try{
        const {userid,Otp}=req.body;                //Whatever is given in body will come to these variables
        

        if(!userid || !Otp){
            return res.status(400).json({success:false,message:'Missing details'})
        }

        try{
            const user=await usermodel.findById(userid);
            if(!user){
                return res.status(404).json({success:false,message:'User not found'})
            }
            if(user.verifyOtp==='' || user.verifyOtp!==Otp){
                return res.status(404).json({success:false,message:'Otp not valid'});
            }
            //Checking if otp is expired or not

            if(user.verifyOtpExpireAt<Date.now()){
                return res.status(404).json({success:false,message:'OTP expired'});
            }

            //Otherwise , user's account will be verified

            user.isAccountVerified=true;
            user.verifyOtp="";
            user.verifyOtpExpireAt=0;
            await user.save();

            return res.status(200).json({success:true,message:'Email successfully verified'});  
        }
        catch(error){
            return res.status(404).json({success:false,message:error.message});
        }
    }
    catch(error){
        return res.status(404).json({success:false,message:error.message});
    }
}

//Check if user is autheticated
export const issessionactive=async (req,res)=>{           //Before calling this we will execute the middleware , if middleware is true then only control will come to this
    // const userid=req.body;
    // try{
    //     if(userid)
    //         return res.status(200).json({success:true});
    //     else
    //         return res.status(401).json({success:false,message:"Not valid session"});
    // }
    // catch(error){
    //     return res.status(404).json({success:false,message:error.message});
    // }
    return res.status(200).json({
        success:true,
        user:{
            id:req.user._id,
            name:req.user.name,
            role:req.user.role,
            email:req.user.email
        }
    });
};

//Password reset otp

export const passwordresetotp=async (req,res)=>{
    try{
        const {email}=req.body;
        if(!email){
            return res.status(404).json({success:false,message:"Enter full email"});
        }
        const user=await usermodel.findOne({email});
        if(!user){
            return res.status(404).json({success:false,message:"User does not exist"});
        }

        //Send OTP
        const otp=String(Math.floor(100000+Math.random()*900000));

        user.resetOtp=otp;
        user.resetOtpExpireAt=Date.now() + 300*1000;

        await user.save();

        const mailoptions={
            from:process.env.SENDER_MAIL,
            to:user.email,
            subject:'Password Reset OTP',
            text:`Your verification OTP is ${otp} , this OTP must be used within 5 minutes`
        }
        
        // await transporter.sendMail(mailoptions);

        res.status(200).json({success:true,message:'Password reset OTP successfully sent to the email'});
    }
    catch(error){
        return res.status(404).json({success:false,message:error.message})
    }
}

export const resetpassword=async (req,res)=>{
    const {email,otp,newpassword}=req.body;
    if(!email || !otp ||newpassword){
        return res.status(400).json({success:false,message:"Please enter all fields"});
    }
    try{
        const user=usermodel.findOne({email});
        if(user.resetOtp==='' || user.resetOtp!==otp){
            return res.status(400).json({success:false,message:"Invalid OTP"});
        }
        if(user.resetOtpExpireAt<Date.now()){
            return res.status(400).json({success:false,message:"OTP expired"});
        }

        const hashedpassword=await bcrypt.hash(newpassword,10);
        user.password=hashedpassword;
        user.resetOtp='';
        user.resetOtpExpireAt='';
        await user.save();

        return res.status(200).json({success:true,message:"Password successfully reset"});
        
    }   
    catch(error){
        return res.status(404).json({success:false,message:error.message});
    }
}


export const RequestAdmin=async (req,res)=>{
    try{
        const {userid}=req.body;
        const user=await usermodel.findById(userid);
        if(!user){
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if (user.role !== 'user') {
            return res.status(400).json({ success: false, message: "Only normal users can request admin access" });
        }
        user.adminRequest=true;
        await user.save();
        
         return res.status(200).json({ success: true, message: "Admin request sent successfully" });
    }
    catch(error){
        return res.status(404).json({success:false,message:error.message});
    }
}

export const ApproveAdmin=async (req,res)=>{
    try{
        const {userid}=req.body;
        const user=await usermodel.findById(userid);
        if(!user){
            return res.status(404).json({success:false,message:"User does not exist"});    
        }
        if(!user.adminRequest || user.role!=="user"){
            return res.status(400).json({ success: false, message: "Not a valid request" });
        }
        user.adminRequest=false;
        user.role="admin";
        await user.save();

        return res.status(200).json({success:true,message:"Successfully created admin"});


    }
    catch(error){
        return res.status(404).json({success:false,message:error.message});
    }
}

export const RejectAdmin=async (req,res)=>{
    try{
        const {userid}=req.body;
        const user=await usermodel.findById(userid);
        if(!user){
            return res.status(404).json({success:false,message:"User does not exist"});    
        }
        if(!user.adminRequest || user.role!=="user"){
            return res.status(400).json({ success: false, message: "Not a valid request" });
        }
        user.adminRequest=false;
        user.role="user";
        await user.save();

        return res.status(200).json({success:true,message:"Admin Request rejected"});


    }
    catch(error){
        return res.status(404).json({success:false,message:error.message});
    }
}


export const suspendUser = async (req, res) => {
    try {
        const { userId } = req.body;

        const user=await usermodel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.role === "admin" || user.role === "superadmin") {
            return res.status(403).json({
                success: false,
                message: "You cannot suspend admins or superadmins"
            });
        }

        user.isSuspended=true;
        await user.save();

        res.json({ success: true, message: "User suspended" });
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const activateUser = async (req, res) => {
    try {
        const { userId } = req.body;

        const user=await usermodel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.role === "admin" || user.role === "superadmin") {
            return res.status(403).json({
                success: false,
                message: "You cannot activate admins or superadmins"
            });
        }

        
        user.isSuspended=false;
        await user.save();

        res.json({ success: true, message: "User activated" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

