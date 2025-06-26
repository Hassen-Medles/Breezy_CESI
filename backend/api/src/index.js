import express from 'express';
import mongoose from 'mongoose';
import postRoutes from './routes/post.route.js';
import userRoutes from './routes/user.route.js';
import commentRoutes from './routes/comment.route.js';
import friendRoutes from './routes/friend.route.js';
import conversationRoutes from './routes/conversation.route.js';
import messageRoutes from './routes/message.route.js';
import notificationRoutes from './routes/notification.route.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
// Configuration CORS robuste
app.use(cors({
  origin: ["http://localhost:8080", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"]
}));
app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('MongoDB connecté'))
  .catch((err) => console.error('Erreur MongoDB :', err));

app.use('/api', postRoutes);
app.use('/api/user', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/friend', friendRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});