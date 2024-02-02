const mongoose = require('mongoose');

const UserStatusSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    status: {
        type: String,
        required: true,
        enum: ['online', 'offline'],
    },
    lastSeen: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('UserStatus', UserStatusSchema);
