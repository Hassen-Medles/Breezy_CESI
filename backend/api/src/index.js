const express = require('express');
const mongoose = require('mongoose');
const postRoutes = require('./routes/post.route');
const app = express();

app.use(express.json());
mongoose.connect('mongodb://localhost:27017/breezy')
  .then(() => console.log('MongoDB connecté'))
  .catch((err) => console.error('Erreur MongoDB :', err));
app.use('/api', postRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});