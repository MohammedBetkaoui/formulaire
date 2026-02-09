require('dotenv').config();
const mongoose = require('mongoose');
const BilanVisuel = require('./models/BilanVisuel');

// Données de test
const bilansTest = [
  {
    nom: 'DIALLO',
    prenom: 'Amadou',
    age: 28,
    sexe: 'Masculin',
    telephone: '77 123 45 67',
    motifConsultation: 'Baisse d\'acuité visuelle',
    antecedentsMedicaux: 'Aucun',
    antecedentsOphtalmologiques: 'Aucun',
    acuiteVisuelle: {
      oeilDroit: {
        loin: { sansCorrection: '5/10', avecCorrection: '10/10' },
        pres: { sansCorrection: 'P3', avecCorrection: 'P2' }
      },
      oeilGauche: {
        loin: { sansCorrection: '4/10', avecCorrection: '10/10' },
        pres: { sansCorrection: 'P3', avecCorrection: 'P2' }
      },
      binoculaire: { loin: '10/10', pres: 'P2' }
    },
    refraction: {
      oeilDroit: { sphere: -2.00, cylindre: -0.50, axe: 90, addition: 0 },
      oeilGauche: { sphere: -2.25, cylindre: -0.75, axe: 85, addition: 0 }
    },
    motiliteOculaire: 'Normal',
    visionBinoculaire: 'Normal',
    champVisuel: 'Normal',
    testCouleur: 'Normal',
    anomaliesDetectees: ['Myopie', 'Astigmatisme'],
    diagnostic: 'Myopie bilatérale avec astigmatisme',
    observations: 'Patient jeune, première consultation',
    prescription: 'Lunettes de correction pour loin et près',
    orientation: 'Contrôle dans 1 an',
    examinateur: 'Dr. FALL'
  },
  {
    nom: 'KANE',
    prenom: 'Fatou',
    age: 52,
    sexe: 'Féminin',
    telephone: '76 234 56 78',
    motifConsultation: 'Fatigue visuelle',
    antecedentsMedicaux: 'Hypertension',
    antecedentsOphtalmologiques: 'Aucun',
    acuiteVisuelle: {
      oeilDroit: {
        loin: { sansCorrection: '10/10', avecCorrection: '10/10' },
        pres: { sansCorrection: 'P5', avecCorrection: 'P2' }
      },
      oeilGauche: {
        loin: { sansCorrection: '10/10', avecCorrection: '10/10' },
        pres: { sansCorrection: 'P5', avecCorrection: 'P2' }
      },
      binoculaire: { loin: '10/10', pres: 'P2' }
    },
    refraction: {
      oeilDroit: { sphere: 0.00, cylindre: 0.00, axe: 0, addition: 2.00 },
      oeilGauche: { sphere: 0.00, cylindre: 0.00, axe: 0, addition: 2.00 }
    },
    motiliteOculaire: 'Normal',
    visionBinoculaire: 'Normal',
    champVisuel: 'Normal',
    testCouleur: 'Normal',
    anomaliesDetectees: ['Presbytie'],
    diagnostic: 'Presbytie',
    observations: 'Début de presbytie typique',
    prescription: 'Lunettes de lecture +2.00',
    orientation: 'Contrôle annuel',
    examinateur: 'Dr. SECK'
  },
  {
    nom: 'NDIAYE',
    prenom: 'Ibrahima',
    age: 18,
    sexe: 'Masculin',
    telephone: '70 345 67 89',
    motifConsultation: 'Contrôle de routine',
    antecedentsMedicaux: 'Aucun',
    antecedentsOphtalmologiques: 'Aucun',
    acuiteVisuelle: {
      oeilDroit: {
        loin: { sansCorrection: '10/10', avecCorrection: '10/10' },
        pres: { sansCorrection: 'P2', avecCorrection: 'P2' }
      },
      oeilGauche: {
        loin: { sansCorrection: '10/10', avecCorrection: '10/10' },
        pres: { sansCorrection: 'P2', avecCorrection: 'P2' }
      },
      binoculaire: { loin: '10/10', pres: 'P2' }
    },
    refraction: {
      oeilDroit: { sphere: 0.00, cylindre: 0.00, axe: 0, addition: 0 },
      oeilGauche: { sphere: 0.00, cylindre: 0.00, axe: 0, addition: 0 }
    },
    motiliteOculaire: 'Normal',
    visionBinoculaire: 'Normal',
    champVisuel: 'Normal',
    testCouleur: 'Normal',
    anomaliesDetectees: [],
    diagnostic: 'Vision normale',
    observations: 'Aucune anomalie détectée',
    prescription: 'Aucune',
    orientation: 'Contrôle dans 2 ans',
    examinateur: 'Dr. FALL'
  },
  {
    nom: 'SOW',
    prenom: 'Aissatou',
    age: 35,
    sexe: 'Féminin',
    telephone: '77 456 78 90',
    motifConsultation: 'Céphalées',
    antecedentsMedicaux: 'Migraines',
    antecedentsOphtalmologiques: 'Aucun',
    acuiteVisuelle: {
      oeilDroit: {
        loin: { sansCorrection: '8/10', avecCorrection: '10/10' },
        pres: { sansCorrection: 'P3', avecCorrection: 'P2' }
      },
      oeilGauche: {
        loin: { sansCorrection: '7/10', avecCorrection: '10/10' },
        pres: { sansCorrection: 'P3', avecCorrection: 'P2' }
      },
      binoculaire: { loin: '10/10', pres: 'P2' }
    },
    refraction: {
      oeilDroit: { sphere: 0.50, cylindre: -0.25, axe: 180, addition: 0 },
      oeilGauche: { sphere: 0.75, cylindre: -0.50, axe: 175, addition: 0 }
    },
    motiliteOculaire: 'Normal',
    visionBinoculaire: 'Normal',
    champVisuel: 'Normal',
    testCouleur: 'Normal',
    anomaliesDetectees: ['Hypermétropie', 'Astigmatisme'],
    diagnostic: 'Hypermétropie légère avec astigmatisme',
    observations: 'Céphalées probablement liées à la fatigue visuelle',
    prescription: 'Lunettes de repos',
    orientation: 'Consultation ophtalmologique si céphalées persistent',
    examinateur: 'Dr. SECK'
  },
  {
    nom: 'BA',
    prenom: 'Moussa',
    age: 12,
    sexe: 'Masculin',
    telephone: '76 567 89 01',
    motifConsultation: 'Mauvais résultats scolaires',
    antecedentsMedicaux: 'Aucun',
    antecedentsOphtalmologiques: 'Aucun',
    acuiteVisuelle: {
      oeilDroit: {
        loin: { sansCorrection: '3/10', avecCorrection: '10/10' },
        pres: { sansCorrection: 'P3', avecCorrection: 'P2' }
      },
      oeilGauche: {
        loin: { sansCorrection: '3/10', avecCorrection: '10/10' },
        pres: { sansCorrection: 'P3', avecCorrection: 'P2' }
      },
      binoculaire: { loin: '10/10', pres: 'P2' }
    },
    refraction: {
      oeilDroit: { sphere: -3.50, cylindre: 0.00, axe: 0, addition: 0 },
      oeilGauche: { sphere: -3.75, cylindre: 0.00, axe: 0, addition: 0 }
    },
    motiliteOculaire: 'Normal',
    visionBinoculaire: 'Normal',
    champVisuel: 'Normal',
    testCouleur: 'Normal',
    anomaliesDetectees: ['Myopie'],
    diagnostic: 'Myopie forte bilatérale',
    observations: 'Enfant ne voyant pas le tableau en classe',
    prescription: 'Lunettes de correction permanente',
    orientation: 'Contrôle tous les 6 mois',
    examinateur: 'Dr. FALL'
  },
  {
    nom: 'DIOP',
    prenom: 'Mariama',
    age: 45,
    sexe: 'Féminin',
    telephone: '70 678 90 12',
    motifConsultation: 'Renouvellement de lunettes',
    antecedentsMedicaux: 'Diabète type 2',
    antecedentsOphtalmologiques: 'Myopie depuis l\'enfance',
    acuiteVisuelle: {
      oeilDroit: {
        loin: { sansCorrection: '2/10', avecCorrection: '10/10' },
        pres: { sansCorrection: 'P6', avecCorrection: 'P2' }
      },
      oeilGauche: {
        loin: { sansCorrection: '2/10', avecCorrection: '10/10' },
        pres: { sansCorrection: 'P6', avecCorrection: 'P2' }
      },
      binoculaire: { loin: '10/10', pres: 'P2' }
    },
    refraction: {
      oeilDroit: { sphere: -4.50, cylindre: -0.75, axe: 85, addition: 1.50 },
      oeilGauche: { sphere: -4.75, cylindre: -1.00, axe: 90, addition: 1.50 }
    },
    motiliteOculaire: 'Normal',
    visionBinoculaire: 'Normal',
    champVisuel: 'Normal',
    testCouleur: 'Normal',
    anomaliesDetectees: ['Myopie', 'Astigmatisme', 'Presbytie'],
    diagnostic: 'Myopie forte + début de presbytie',
    observations: 'Diabétique - surveillance rétinienne recommandée',
    prescription: 'Verres progressifs',
    orientation: 'Consultation ophtalmologique annuelle obligatoire',
    examinateur: 'Dr. SECK'
  },
  {
    nom: 'SARR',
    prenom: 'Alioune',
    age: 68,
    sexe: 'Masculin',
    telephone: '77 789 01 23',
    motifConsultation: 'Baisse d\'acuité visuelle progressive',
    antecedentsMedicaux: 'Hypertension, cholestérol',
    antecedentsOphtalmologiques: 'Cataracte suspectée',
    acuiteVisuelle: {
      oeilDroit: {
        loin: { sansCorrection: '4/10', avecCorrection: '6/10' },
        pres: { sansCorrection: 'P6', avecCorrection: 'P4' }
      },
      oeilGauche: {
        loin: { sansCorrection: '3/10', avecCorrection: '5/10' },
        pres: { sansCorrection: 'P6', avecCorrection: 'P5' }
      },
      binoculaire: { loin: '6/10', pres: 'P4' }
    },
    refraction: {
      oeilDroit: { sphere: 1.00, cylindre: -0.50, axe: 90, addition: 2.50 },
      oeilGauche: { sphere: 1.25, cylindre: -0.75, axe: 95, addition: 2.50 }
    },
    motiliteOculaire: 'Normal',
    visionBinoculaire: 'Normal',
    champVisuel: 'Normal',
    testCouleur: 'Non testé',
    anomaliesDetectees: ['Presbytie', 'Hypermétropie'],
    diagnostic: 'Presbytie + Hypermétropie - Cataracte à confirmer',
    observations: 'Vision floue malgré correction - opacification cristallinienne probable',
    prescription: 'Verres progressifs temporaires',
    orientation: 'URGENT : Consultation ophtalmologique pour bilan complet',
    examinateur: 'Dr. FALL'
  },
  {
    nom: 'THIAM',
    prenom: 'Khady',
    age: 8,
    sexe: 'Féminin',
    telephone: '76 890 12 34',
    motifConsultation: 'Dépistage scolaire',
    antecedentsMedicaux: 'Aucun',
    antecedentsOphtalmologiques: 'Aucun',
    acuiteVisuelle: {
      oeilDroit: {
        loin: { sansCorrection: '10/10', avecCorrection: '10/10' },
        pres: { sansCorrection: 'P2', avecCorrection: 'P2' }
      },
      oeilGauche: {
        loin: { sansCorrection: '5/10', avecCorrection: '8/10' },
        pres: { sansCorrection: 'P3', avecCorrection: 'P2' }
      },
      binoculaire: { loin: '10/10', pres: 'P2' }
    },
    refraction: {
      oeilDroit: { sphere: 0.00, cylindre: 0.00, axe: 0, addition: 0 },
      oeilGauche: { sphere: 1.50, cylindre: 0.00, axe: 0, addition: 0 }
    },
    motiliteOculaire: 'Anormal',
    visionBinoculaire: 'Anormal',
    champVisuel: 'Normal',
    testCouleur: 'Normal',
    anomaliesDetectees: ['Amblyopie', 'Strabisme'],
    diagnostic: 'Amblyopie œil gauche + Strabisme convergent',
    observations: 'Enfant clignant souvent des yeux, tête penchée',
    prescription: 'Lunettes + occlusion œil droit',
    orientation: 'Consultation ophtalmologique pédiatrique URGENTE',
    examinateur: 'Dr. SECK'
  }
];

// Fonction pour insérer les données
async function seedDatabase() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Supprimer les données existantes (optionnel)
    const count = await BilanVisuel.countDocuments();
    console.log(`📊 ${count} bilan(s) existant(s) dans la base`);
    
    // Insérer les données de test
    console.log('📝 Insertion des données de test...');
    const result = await BilanVisuel.insertMany(bilansTest);
    console.log(`✅ ${result.length} bilans de test insérés avec succès !`);

    // Afficher un résumé
    const total = await BilanVisuel.countDocuments();
    const parSexe = await BilanVisuel.aggregate([
      { $group: { _id: '$sexe', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📊 Résumé de la base de données:');
    console.log(`   Total de bilans: ${total}`);
    parSexe.forEach(s => {
      console.log(`   ${s._id}: ${s.count}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Terminé !');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Exécuter
seedDatabase();
