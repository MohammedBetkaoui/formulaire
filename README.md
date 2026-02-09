# 🏥 Système de Gestion des Bilans Visuels - Institut BBA

Application web complète pour la saisie, la gestion et l'analyse des bilans visuels effectués à l'Institut BBA.

## 📋 Fonctionnalités

### ✅ Gestion des Bilans
- **Formulaire complet** de saisie des bilans visuels
- Enregistrement des informations patients
- Mesure de l'acuité visuelle (loin/près, OD/OG)
- Réfraction (sphère, cylindre, axe, addition)
- Tests complémentaires (motilité, vision binoculaire, champ visuel, test de couleur)
- Diagnostic et prescription

### 📊 Analyse et Statistiques
- Répartition par sexe
- Répartition par tranches d'âge
- Anomalies les plus fréquentes
- Nombre total de bilans

### 📥 Export de Données
- Export CSV de tous les bilans
- Compatible avec Excel et autres logiciels d'analyse
- Colonnes détaillées pour analyse statistique

### 🔍 Recherche et Filtrage
- Recherche par nom du patient
- Filtrage par sexe
- Filtrage par période de dates

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** - Environnement d'exécution JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **json2csv** - Export CSV

### Frontend
- **HTML5** - Structure
- **CSS3** - Design responsive et moderne
- **JavaScript (Vanilla)** - Interactions client

## 📦 Installation

### Prérequis
- Node.js (version 14 ou supérieure)
- MongoDB (local ou cloud - MongoDB Atlas)
- npm ou yarn

### Étapes d'installation

1. **Cloner ou télécharger le projet**

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer MongoDB**

Ouvrez le fichier `.env` et modifiez la connexion MongoDB si nécessaire :
```env
MONGODB_URI=mongodb://localhost:27017/bba_bilans
PORT=3000
```

Pour utiliser MongoDB Atlas (cloud) :
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bba_bilans
PORT=3000
```

4. **Démarrer MongoDB** (si local)
```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongodb
```

5. **Démarrer le serveur**
```bash
# Mode production
npm start

# Mode développement (avec rechargement automatique)
npm run dev
```

6. **Accéder à l'application**
Ouvrez votre navigateur et allez sur : `http://localhost:3000`

## 📁 Structure du Projet

```
bba-bilan-visuel/
│
├── models/
│   └── BilanVisuel.js          # Modèle MongoDB
│
├── routes/
│   └── bilanRoutes.js          # Routes API
│
├── public/
│   ├── index.html              # Page principale
│   ├── css/
│   │   └── style.css           # Styles CSS
│   └── js/
│       └── app.js              # JavaScript frontend
│
├── .env                        # Configuration (à ne pas versionner)
├── .gitignore                  # Fichiers ignorés par Git
├── package.json                # Dépendances npm
├── server.js                   # Point d'entrée du serveur
└── README.md                   # Documentation
```

## 🔌 API Endpoints

### Bilans
- `POST /api/bilans` - Créer un nouveau bilan
- `GET /api/bilans` - Récupérer tous les bilans
- `GET /api/bilans/:id` - Récupérer un bilan par ID
- `PUT /api/bilans/:id` - Mettre à jour un bilan
- `DELETE /api/bilans/:id` - Supprimer un bilan

### Export
- `GET /api/bilans/export/csv` - Exporter tous les bilans en CSV

### Statistiques
- `GET /api/bilans/stats/overview` - Obtenir les statistiques générales

## 📊 Utilisation

### 1. Créer un Nouveau Bilan
1. Cliquez sur l'onglet **"Nouveau Bilan"**
2. Remplissez les informations du patient (nom, prénom, âge, sexe obligatoires)
3. Saisissez le motif de consultation
4. Complétez les mesures d'acuité visuelle
5. Ajoutez la réfraction si nécessaire
6. Effectuez les tests complémentaires
7. Notez le diagnostic et les anomalies détectées
8. Cliquez sur **"Enregistrer le Bilan"**

### 2. Consulter les Bilans
1. Cliquez sur l'onglet **"Liste des Bilans"**
2. Utilisez les filtres pour rechercher des bilans spécifiques
3. Cliquez sur **"Voir"** pour afficher les détails d'un bilan
4. Cliquez sur l'icône de corbeille pour supprimer un bilan

### 3. Exporter les Données
1. Allez dans l'onglet **"Liste des Bilans"**
2. Cliquez sur **"Exporter CSV"**
3. Le fichier CSV sera téléchargé automatiquement

### 4. Consulter les Statistiques
1. Cliquez sur l'onglet **"Statistiques"**
2. Visualisez les données agrégées :
   - Total des bilans
   - Répartition par sexe
   - Répartition par âge
   - Anomalies les plus fréquentes

## 🔒 Sécurité

Pour une utilisation en production, pensez à :
- Ajouter une authentification (JWT, sessions)
- Utiliser HTTPS
- Valider les entrées côté serveur
- Limiter le nombre de requêtes (rate limiting)
- Sauvegarder régulièrement la base de données

## 🚀 Déploiement

### Option 1: Serveur Node.js
```bash
npm start
```

### Option 2: PM2 (recommandé pour production)
```bash
npm install -g pm2
pm2 start server.js --name bba-bilans
pm2 save
pm2 startup
```

### Option 3: Docker
Créer un `Dockerfile` :
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🐛 Résolution de Problèmes

### MongoDB ne se connecte pas
- Vérifiez que MongoDB est en cours d'exécution
- Vérifiez l'URL de connexion dans `.env`
- Vérifiez les permissions réseau pour MongoDB Atlas

### Le serveur ne démarre pas
- Vérifiez que le port 3000 n'est pas déjà utilisé
- Vérifiez que toutes les dépendances sont installées

### Les données ne s'affichent pas
- Vérifiez la console du navigateur (F12)
- Vérifiez que le backend est accessible
- Vérifiez les CORS si frontend et backend sont sur des ports différents

## 📝 Notes pour la Recherche

Ce système permet de collecter et d'analyser les données pour votre mémoire sur :
- La classification des bilans par âge, sexe et motif
- Les anomalies visuelles les plus fréquentes
- L'analyse de la population étudiée
- La génération de graphiques et tableaux statistiques

## 🤝 Support

Pour toute question ou problème :
- Vérifiez la documentation
- Consultez les logs du serveur
- Vérifiez la console du navigateur

## 📄 Licence

Ce projet est développé pour l'Institut BBA dans le cadre d'un mémoire de recherche en optométrie.

---

**Développé pour l'Institut BBA** 🏥
*Système de gestion des bilans visuels et de dépistage*
