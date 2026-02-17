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
.then(async () => {
  console.log('✅ Connecté à MongoDB');
  // Supprimer les anciens index obsolètes (ex: idPatient)
  try {
    const collection = mongoose.connection.collection('bilanvisuels');
    const indexes = await collection.indexes();
    for (const idx of indexes) {
      if (idx.name !== '_id_' && !Object.keys(idx.key).every(k => ['_id','nom','prenom','createdAt'].includes(k))) {
        // Drop indexes on fields that no longer exist in the schema
        if (idx.key.idPatient !== undefined || idx.key.dateExamen !== undefined) {
          await collection.dropIndex(idx.name);
          console.log(`🗑️  Index obsolète "${idx.name}" supprimé`);
        }
      }
    }
  } catch (e) {
    // Ignore si la collection n'existe pas encore
  }
})
.catch((err) => console.error('❌ Erreur de connexion MongoDB:', err));

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
