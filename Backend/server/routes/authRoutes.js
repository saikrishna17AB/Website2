import express from 'express'
import {register,login,logout,sendotp,verifyemail,issessionactive,passwordresetotp,resetpassword,RequestAdmin,ApproveAdmin,RejectAdmin,suspendUser,activateUser} from '../controllers/authController.js'
import {userAuth,requireRole,adminapprove} from '../middlewares/userAuth.js'
const authRouter=express.Router();

authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
authRouter.post('/sendverifyotp',userAuth,sendotp);
authRouter.post('/verifyaccount',userAuth,verifyemail);
authRouter.post('/issessionactive',userAuth,issessionactive);
authRouter.post('/sendpasswordresetotp',passwordresetotp);
authRouter.post('/passwordreset',resetpassword);
authRouter.post('/requestadmin',userAuth,RequestAdmin);
authRouter.post('/approveadmin',adminapprove,requireRole('superadmin'),ApproveAdmin);
authRouter.post('/rejectadmin',adminapprove,requireRole('superadmin'),RejectAdmin);
authRouter.post('/suspenduser',userAuth,requireRole('admin'),suspendUser);
authRouter.post('/activateuser',userAuth,requireRole('admin'),activateUser);

export default authRouter;  
