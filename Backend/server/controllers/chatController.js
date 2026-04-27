import Message from '../Models/messageModel.js'


export const getMessages = async (req, res) => {
    try{
        const messages = await Message.find()
            .sort({ createdAt: 1 })
            .limit(100);

        res.json({ success: true, messages });
    } 
    catch {
        res.status(500).json({ success: false });
    }
};

export const handleSendMessage = async (data) => {
    try{
        const message = await Message.create({
            name: data.name,
            role: data.role,
            text: data.text
        });

        return message;
    } 
    catch (err) {
        console.log(err);
        throw err;
    }
};