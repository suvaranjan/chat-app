const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    }],
    chats: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
    }],
    avatar: {
        type: String,
        default: 'https://bit.ly/broken-link',
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Group', GroupSchema);
