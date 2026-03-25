import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import urlRouter from './routes/urlRoutes.js';
import reportRouter from './routes/reportRoutes.js';

const app=express();
const port=process.env.PORT || 4000;
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:5500","http://127.0.0.1:5500"],  
    credentials: true
}));

//API endpoints


app.get('/login',(req,res)=>{
    res.sendFile(path.resolve("Frontend/login.html"));
});
app.use('/api/auth',authRouter);    
app.use('/api/user',userRouter);
app.use('/api/url',urlRouter);
app.use('/api/report',reportRouter);

app.listen(port,()=> console.log(`Server started at port : ${port}`));