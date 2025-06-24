import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        trim: true,
    },
    profilePicture: {
        type: String,
        default: '../../defaultimage.png',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ['user', 'admin','moderator'],
        default: 'user',
        required: true,
    },
}, { timestamps: true });
const User = mongoose.model('User', userSchema);
export default User;