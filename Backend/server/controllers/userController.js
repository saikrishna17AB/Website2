import usermodel from '../Models/userModel.js'

export const getuserdata=async (req,res)=>{
    try{
        const {userid}=req.body;
        const user=await usermodel.findById(userid);
        if(!user){
            return res.status(400).json({success:false,message:error.message});
        }

        return res.status(200).json({success:true,
            userdata:{
                name:user.name,
                email:user.email,
                isAccountVerified:user.isAccountVerified,
                role:user.role,
                adminRequest:user.adminRequest
            }
        });

    }
    catch(error){
        return res.status(404).json({success:false,message:error.message});
    }
}

export const getAdminRequests= async (req,res)=>{
    try{
        const users=await usermodel.find({
            adminRequest:true,
            role:'user'
        }).select('name email role adminRequest');

        return res.status(200).json({ success: true, users });
    }
    catch(error){
        return res.status(404).json({success:false,message:error.message});
    }
}

export const getAllUsers=async (req,res)=>{
    try{
        const users = await usermodel.find().select(
            "name email role isAccountVerified adminRequest"
        );

        return res.status(200).json({
            success: true,
            users
        });

    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        });
    
    }
}

