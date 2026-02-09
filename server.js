require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bilanRoutes = require('./routes/bilanRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ Connecté à MongoDB'))
.catch((err) => console.error('❌ Erreur de connexion MongoDB:', err));

// Routes
app.use('/api/bilans', bilanRoutes);

// Route principale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
