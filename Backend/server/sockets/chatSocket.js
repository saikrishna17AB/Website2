import { handleSendMessage } from "../controllers/chatController.js";

export const chatSocket = (io, socket) => {

    socket.on("sendMessage", async (data) => {
        try {
            const message = await handleSendMessage(data);

            io.emit("receiveMessage", message);
        } catch (err) {
            console.log(err);
        }
    });



};