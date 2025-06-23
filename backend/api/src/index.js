const express = require('express');
const mongoose = require('mongoose');
const postRoutes = require('./routes/post.route');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Ajouté pour lire les cookies
require('dotenv').config();

const app = express();
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());
app.use(cookieParser()); // Ajouté pour lire les cookies httpOnly


mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('MongoDB connecté'))
  .catch((err) => console.error('Erreur MongoDB :', err));

app.use('/api', postRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});