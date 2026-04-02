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

// Connexion à MongoDB pour Vercel (Serverless)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('✅ Utilisation de la connexion MongoDB existante');
    return;
  }
  
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = db.connections[0].readyState === 1;
    console.log('✅ Nouvelle connexion à MongoDB établie');
  } catch (error) {
    console.error('❌ Erreur critique de connexion MongoDB:', error);
    throw error;
  }
};

// Middleware pour s'assurer que la DB est connectée avant chaque requête API
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur de connexion à la base de données", error: error.message });
  }
});

// Routes
app.use('/api/bilans', bilanRoutes);

// Route principale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  });
}

// Export pour Vercel
module.exports = app;
