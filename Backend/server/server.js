import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import urlRouter from './routes/urlRoutes.js';
import reportRouter from './routes/reportRoutes.js';
import chatRouter from './routes/chatRoutes.js';
import {Server} from "socket.io";
import http from "http";
import {chatSocket} from "./sockets/chatSocket.js";

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
app.use('/api/chat',chatRouter);

const server=http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5500","http://127.0.0.1:5500"],
        credentials: true
    }
})
io.on("connection", (socket) => {
    chatSocket(io, socket);
});

server.listen(port,()=>{
    console.log(`Server and Socket running at port : ${port}`)
});
// app.listen(port,()=> console.log(`Server started at port : ${port}`));