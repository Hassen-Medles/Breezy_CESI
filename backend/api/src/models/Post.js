import mongoose from 'mongoose';
const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        maxlength: 280
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    image: {
        type: String, // Chemin du fichier image
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    deleted: {
        type: Boolean,
        default: false
    },
    reportCount: {
        type: Number,
        default: 0
    }
});
const Post = mongoose.model('Post', postSchema);
export default Post;