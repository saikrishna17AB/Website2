import express from "express";
import { getMessages } from "../controllers/chatController.js";

const chatRouter = express.Router();

chatRouter.get("/messages", getMessages);

export default chatRouter;