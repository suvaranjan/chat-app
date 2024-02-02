const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 50,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 4,
    },
    avatar: {
        type: String,
    },
    friends: [{
        friend: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
        },
    }],
    groups: [{
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
        },
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
        },
    }],
    friendRequestsSent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    friendRequestsReceived: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    status: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserStatus',
    },
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

module.exports = mongoose.model('User', UserSchema);
