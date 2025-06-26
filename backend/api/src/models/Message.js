import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
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
    image: { type: String },
    content: {
        type: String,
        required: false, // Autorise les messages sans texte si une image est présente
        maxlength: 500
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.model('Message', messageSchema);