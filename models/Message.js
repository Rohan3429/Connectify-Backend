const mongoose = require('mongoose');

// Message Schema
const messageSchema = new mongoose.Schema({
    conversationId: String,
    senderId: String,
    receiverId: String,
    text: String,
    senderName: String,
    timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);  
module.exports = Message;