const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 500
    },
    deleted: {
        type: Boolean,
        default: false
    },
    timestamps: {
        createdAt: {
            type: Date,
            default: Date.now
        },
    }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;