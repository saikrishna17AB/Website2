import express from 'express'
import {getuserdata,getAdminRequests} from '../controllers/userController.js'
import {issessionactive,logout} from '../controllers/authController.js'
import {userAuth,requireRole} from '../middlewares/userAuth.js'
const userRouter=express.Router();

userRouter.get('/userdata',userAuth,getuserdata);
userRouter.get('/getadminrequests',userAuth,requireRole('superadmin'),getAdminRequests);
userRouter.get('/check-auth',userAuth,issessionactive);
userRouter.get('/logout',logout)

export default userRouter;      