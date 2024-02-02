const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        minlength: 1,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Chat',
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    seenBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
});

module.exports = mongoose.model('Message', MessageSchema);
