# Guide de Démarrage Rapide

## 🚀 Démarrage en 5 minutes

### 1️⃣ Installation des dépendances
```bash
npm install
```

### 2️⃣ Configuration MongoDB

**Option A : MongoDB Local**
- Assurez-vous que MongoDB est installé et en cours d'exécution
- L'URL de connexion par défaut est : `mongodb://localhost:27017/bba_bilans`

**Option B : MongoDB Atlas (Cloud - Recommandé)**
1. Créez un compte gratuit sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un nouveau cluster (Free Tier M0)
3. Créez un utilisateur de base de données
4. Ajoutez votre adresse IP (ou 0.0.0.0/0 pour tout autoriser)
5. Obtenez votre chaîne de connexion
6. Modifiez le fichier `.env` :
```env
MONGODB_URI=mongodb+srv://votre_utilisateur:votre_mot_de_passe@cluster.mongodb.net/bba_bilans
PORT=3000
```

### 3️⃣ Démarrer l'application
```bash
npm start
```

### 4️⃣ Accéder à l'application
Ouvrez votre navigateur et allez sur : **http://localhost:3000**

---

## 📝 Création d'un Premier Bilan

1. Cliquez sur l'onglet **"📝 Nouveau Bilan"**
2. Remplissez au minimum les champs obligatoires (*) :
   - Nom : `DIALLO`
   - Prénom : `Amadou`
   - Âge : `25`
   - Sexe : `Masculin`
   - Motif : `Contrôle de routine`
3. Ajoutez d'autres informations si nécessaire
4. Cliquez sur **"💾 Enregistrer le Bilan"**

---

## 🧪 Test de l'API avec curl ou Postman

### Créer un bilan
```bash
curl -X POST http://localhost:3000/api/bilans \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "DIALLO",
    "prenom": "Amadou",
    "age": 25,
    "sexe": "Masculin",
    "motifConsultation": "Contrôle de routine",
    "acuiteVisuelle": {
      "oeilDroit": {
        "loin": {
          "sansCorrection": "10/10"
        }
      },
      "oeilGauche": {
        "loin": {
          "sansCorrection": "10/10"
        }
      }
    }
  }'
```

### Récupérer tous les bilans
```bash
curl http://localhost:3000/api/bilans
```

### Exporter en CSV
```bash
curl http://localhost:3000/api/bilans/export/csv -o bilans.csv
```

---

## 🔧 Commandes npm

| Commande | Description |
|----------|-------------|
| `npm install` | Installer les dépendances |
| `npm start` | Démarrer le serveur |
| `npm run dev` | Démarrer en mode développement (rechargement auto) |

---

## ⚠️ Problèmes Courants

### ❌ Erreur : "Cannot connect to MongoDB"
**Solution :** Vérifiez que MongoDB est en cours d'exécution ou que votre URL de connexion MongoDB Atlas est correcte.

### ❌ Erreur : "Port 3000 already in use"
**Solution :** Modifiez le port dans `.env` :
```env
PORT=3001
```

### ❌ Les bilans ne s'affichent pas
**Solution :** Ouvrez la console du navigateur (F12) pour voir les erreurs. Vérifiez que le serveur backend est accessible.

---

## 📊 Données de Test

Pour tester l'application, voici quelques exemples de bilans :

### Patient 1 - Myopie
- Nom : KANE
- Prénom : Fatou
- Âge : 28 ans
- Sexe : Féminin
- Motif : Baisse d'acuité visuelle
- Réfraction OD : Sphère -2.00
- Réfraction OG : Sphère -2.25
- Anomalie : Myopie

### Patient 2 - Presbytie
- Nom : SECK
- Prénom : Ibrahima
- Âge : 52 ans
- Sexe : Masculin
- Motif : Fatigue visuelle
- Addition : +2.00
- Anomalie : Presbytie

### Patient 3 - Contrôle normal
- Nom : NDIAYE
- Prénom : Awa
- Âge : 18 ans
- Sexe : Féminin
- Motif : Contrôle de routine
- Acuité visuelle : 10/10 binoculaire
- Anomalie : Aucune

---

## 🎯 Prochaines Étapes

1. ✅ Créer plusieurs bilans de test
2. ✅ Tester les filtres de recherche
3. ✅ Consulter les statistiques
4. ✅ Exporter les données en CSV
5. ✅ Analyser les données dans Excel

---

**Bon travail ! 👨‍⚕️👩‍⚕️**
