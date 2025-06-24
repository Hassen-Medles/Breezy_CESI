import express from 'express';
import mongoose from 'mongoose';
import postRoutes from './routes/post.route.js';
import userRoutes from './routes/user.route.js';
import commentRoutes from './routes/comment.route.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();
console.log('AUTH_TOKEN:', process.env.AUTH_TOKEN);

const app = express();
// Configuration CORS robuste
app.use(cors({
  origin: ["http://localhost:8080", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('MongoDB connecté'))
  .catch((err) => console.error('Erreur MongoDB :', err));

app.use('/api', postRoutes);
app.use('/api/user', userRoutes);
app.use('/api/comments', commentRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});