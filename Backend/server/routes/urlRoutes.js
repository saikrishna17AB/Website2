import express from 'express'
import {checkurl,checkemail} from '../controllers/urlController.js';
const urlRouter=express.Router();

urlRouter.post('/checkurl',checkurl);
urlRouter.post('/checkemail',checkemail);
export default urlRouter;
