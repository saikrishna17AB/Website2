import express from 'express'
import {createReport,getMyReports,getAllReports,reviewReport,getReportById} from '../controllers/reportController.js';
import {userAuth,requireRole} from '../middlewares/userAuth.js';
const reportRouter=express.Router();

reportRouter.post('/create',userAuth,createReport);
reportRouter.get('/my',userAuth,getMyReports);
reportRouter.get('/all',userAuth,requireRole("admin"),getAllReports);
reportRouter.post('/review',userAuth,requireRole("admin"),reviewReport);
reportRouter.get('/:id',userAuth,requireRole("admin"),getReportById);


export default reportRouter;