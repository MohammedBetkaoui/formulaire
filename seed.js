require('dotenv').config();
const mongoose = require('mongoose');
const BilanVisuel = require('./models/BilanVisuel');

// Données de test selon le nouveau schéma 6 sections
const bilansTest = [
  {
    // Section 1: Identification
    nom: 'DIALLO',
    prenom: 'Amadou',
    age: 28,
    sexe: 'Homme',
    profession: 'Informaticien (travail sur écran)',
    motifConsultation: 'Baisse d\'acuité',
    // Section 2: Anamnèse
    antecedentsOculaires: 'Aucun',
    antecedentsSystemiques: 'Aucun',
    correctionActuelle: 'Non',
    puissanceVerresActuels: { od: '', og: '' },
    // Section 3: Pré-tests
    avsc: { od: '5/10', og: '4/10', bin: '6/10' },
    avcc: { od: '10/10', og: '10/10', bin: '10/10' },
    pio: { od: 14, og: 15 },
    motiliteOculaire: 'Normale',
    testIshihara: '38/38 Normal',
    // Section 4: Réfraction
    refractionObjective: {
      od: { sphere: -2.00, cylindre: -0.50, axe: 90 },
      og: { sphere: -2.25, cylindre: -0.75, axe: 85 }
    },
    refractionSubjective: {
      od: { sphere: -1.75, cylindre: -0.50, axe: 90, acuiteFinale: '10/10' },
      og: { sphere: -2.00, cylindre: -0.75, axe: 85, acuiteFinale: '10/10' }
    },
    visionDePres: { addition: null, parinaud: 'P2' },
    // Section 5: Vision binoculaire
    stereopsie: '60 sec d\'arc',
    ppc: '8 cm',
    examenLampeAFente: 'Cornée claire, cristallin transparent, conjonctive normale',
    // Section 6: Diagnostic
    typeAnomalie: ['Myopie', 'Astigmatisme'],
    actionEntreprise: 'Prescription de lunettes',
    noteLibre: 'Patient jeune, première consultation. Fatigue visuelle liée au travail sur écran.'
  },
  {
    nom: 'KANE',
    prenom: 'Fatou',
    age: 52,
    sexe: 'Femme',
    profession: 'Enseignante',
    motifConsultation: 'Vision floue de près',
    antecedentsOculaires: 'Aucun',
    antecedentsSystemiques: 'Hypertension',
    correctionActuelle: 'Non',
    puissanceVerresActuels: { od: '', og: '' },
    avsc: { od: '10/10', og: '10/10', bin: '10/10' },
    avcc: { od: '10/10', og: '10/10', bin: '10/10' },
    pio: { od: 16, og: 17 },
    motiliteOculaire: 'Normale',
    testIshihara: '38/38 Normal',
    refractionObjective: {
      od: { sphere: 0.00, cylindre: 0.00, axe: 0 },
      og: { sphere: 0.00, cylindre: 0.00, axe: 0 }
    },
    refractionSubjective: {
      od: { sphere: 0.00, cylindre: 0.00, axe: 0, acuiteFinale: '10/10' },
      og: { sphere: 0.00, cylindre: 0.00, axe: 0, acuiteFinale: '10/10' }
    },
    visionDePres: { addition: 2.00, parinaud: 'P2' },
    stereopsie: '40 sec d\'arc',
    ppc: '10 cm',
    examenLampeAFente: 'Cornée claire, début d\'opacification cristallinienne, conjonctive saine',
    typeAnomalie: ['Presbytie'],
    actionEntreprise: 'Prescription de lunettes',
    noteLibre: 'Début de presbytie typique. Lunettes de lecture +2.00.'
  },
  {
    nom: 'NDIAYE',
    prenom: 'Ibrahima',
    age: 18,
    sexe: 'Homme',
    profession: 'Étudiant',
    motifConsultation: 'Contrôle de routine',
    antecedentsOculaires: 'Aucun',
    antecedentsSystemiques: 'Aucun',
    correctionActuelle: 'Non',
    puissanceVerresActuels: { od: '', og: '' },
    avsc: { od: '10/10', og: '10/10', bin: '10/10' },
    avcc: { od: '10/10', og: '10/10', bin: '10/10' },
    pio: { od: 13, og: 13 },
    motiliteOculaire: 'Normale',
    testIshihara: '38/38 Normal',
    refractionObjective: {
      od: { sphere: 0.00, cylindre: 0.00, axe: 0 },
      og: { sphere: 0.00, cylindre: 0.00, axe: 0 }
    },
    refractionSubjective: {
      od: { sphere: 0.00, cylindre: 0.00, axe: 0, acuiteFinale: '10/10' },
      og: { sphere: 0.00, cylindre: 0.00, axe: 0, acuiteFinale: '10/10' }
    },
    visionDePres: { addition: null, parinaud: 'P1.5' },
    stereopsie: '40 sec d\'arc',
    ppc: '6 cm',
    examenLampeAFente: 'Normal',
    typeAnomalie: ['Emmétrope'],
    actionEntreprise: 'Simple surveillance',
    noteLibre: 'Vision normale. Contrôle dans 2 ans.'
  },
  {
    nom: 'SOW',
    prenom: 'Aissatou',
    age: 35,
    sexe: 'Femme',
    profession: 'Secrétaire (travail sur écran)',
    motifConsultation: 'Céphalées',
    antecedentsOculaires: 'Aucun',
    antecedentsSystemiques: 'Migraines',
    correctionActuelle: 'Non',
    puissanceVerresActuels: { od: '', og: '' },
    avsc: { od: '8/10', og: '7/10', bin: '9/10' },
    avcc: { od: '10/10', og: '10/10', bin: '10/10' },
    pio: { od: 15, og: 14 },
    motiliteOculaire: 'Normale',
    testIshihara: '38/38 Normal',
    refractionObjective: {
      od: { sphere: 0.50, cylindre: -0.25, axe: 180 },
      og: { sphere: 0.75, cylindre: -0.50, axe: 175 }
    },
    refractionSubjective: {
      od: { sphere: 0.50, cylindre: -0.25, axe: 180, acuiteFinale: '10/10' },
      og: { sphere: 0.75, cylindre: -0.50, axe: 175, acuiteFinale: '10/10' }
    },
    visionDePres: { addition: null, parinaud: 'P2' },
    stereopsie: '60 sec d\'arc',
    ppc: '8 cm',
    examenLampeAFente: 'Cornée claire, cristallin transparent',
    typeAnomalie: ['Hypermétropie', 'Astigmatisme'],
    actionEntreprise: 'Prescription de lunettes',
    noteLibre: 'Céphalées liées à la fatigue visuelle. Lunettes de repos prescrites.'
  },
  {
    nom: 'BA',
    prenom: 'Moussa',
    age: 12,
    sexe: 'Homme',
    profession: 'Élève',
    motifConsultation: 'Baisse d\'acuité',
    antecedentsOculaires: 'Aucun',
    antecedentsSystemiques: 'Aucun',
    correctionActuelle: 'Non',
    puissanceVerresActuels: { od: '', og: '' },
    avsc: { od: '3/10', og: '3/10', bin: '4/10' },
    avcc: { od: '10/10', og: '10/10', bin: '10/10' },
    pio: { od: 12, og: 12 },
    motiliteOculaire: 'Normale',
    testIshihara: '38/38 Normal',
    refractionObjective: {
      od: { sphere: -3.50, cylindre: 0.00, axe: 0 },
      og: { sphere: -3.75, cylindre: 0.00, axe: 0 }
    },
    refractionSubjective: {
      od: { sphere: -3.50, cylindre: 0.00, axe: 0, acuiteFinale: '10/10' },
      og: { sphere: -3.75, cylindre: 0.00, axe: 0, acuiteFinale: '10/10' }
    },
    visionDePres: { addition: null, parinaud: 'P2' },
    stereopsie: '60 sec d\'arc',
    ppc: '7 cm',
    examenLampeAFente: 'Normal',
    typeAnomalie: ['Myopie'],
    actionEntreprise: 'Prescription de lunettes',
    noteLibre: 'Enfant ne voyant pas le tableau. Lunettes de correction permanente. Contrôle tous les 6 mois.'
  },
  {
    nom: 'DIOP',
    prenom: 'Mariama',
    age: 45,
    sexe: 'Femme',
    profession: 'Commerçante',
    motifConsultation: 'Renouvellement de lunettes',
    antecedentsOculaires: 'Myopie depuis l\'enfance',
    antecedentsSystemiques: 'Diabète type 2',
    correctionActuelle: 'Oui',
    puissanceVerresActuels: { od: '-4.00 (-0.50) 85°', og: '-4.25 (-0.75) 90°' },
    avsc: { od: '2/10', og: '2/10', bin: '3/10' },
    avcc: { od: '10/10', og: '10/10', bin: '10/10' },
    pio: { od: 18, og: 17 },
    motiliteOculaire: 'Normale',
    testIshihara: '38/38 Normal',
    refractionObjective: {
      od: { sphere: -4.50, cylindre: -0.75, axe: 85 },
      og: { sphere: -4.75, cylindre: -1.00, axe: 90 }
    },
    refractionSubjective: {
      od: { sphere: -4.50, cylindre: -0.75, axe: 85, acuiteFinale: '10/10' },
      og: { sphere: -4.75, cylindre: -1.00, axe: 90, acuiteFinale: '10/10' }
    },
    visionDePres: { addition: 1.50, parinaud: 'P2' },
    stereopsie: '60 sec d\'arc',
    ppc: '10 cm',
    examenLampeAFente: 'Cornée claire, cristallin avec légère opacification sous-capsulaire',
    typeAnomalie: ['Myopie', 'Astigmatisme', 'Presbytie'],
    actionEntreprise: 'Prescription de lunettes',
    noteLibre: 'Diabétique - surveillance rétinienne recommandée. Verres progressifs prescrits.'
  },
  {
    nom: 'SARR',
    prenom: 'Alioune',
    age: 68,
    sexe: 'Homme',
    profession: 'Retraité',
    motifConsultation: 'Baisse d\'acuité',
    antecedentsOculaires: 'Cataracte suspectée',
    antecedentsSystemiques: 'Hypertension, cholestérol',
    correctionActuelle: 'Oui',
    puissanceVerresActuels: { od: '+0.75 (-0.25) 90° Add +2.00', og: '+1.00 (-0.50) 95° Add +2.00' },
    avsc: { od: '4/10', og: '3/10', bin: '5/10' },
    avcc: { od: '6/10', og: '5/10', bin: '6/10' },
    pio: { od: 19, og: 20 },
    motiliteOculaire: 'Normale',
    testIshihara: '35/38 Anomalie légère',
    refractionObjective: {
      od: { sphere: 1.00, cylindre: -0.50, axe: 90 },
      og: { sphere: 1.25, cylindre: -0.75, axe: 95 }
    },
    refractionSubjective: {
      od: { sphere: 1.00, cylindre: -0.50, axe: 90, acuiteFinale: '6/10' },
      og: { sphere: 1.25, cylindre: -0.75, axe: 95, acuiteFinale: '5/10' }
    },
    visionDePres: { addition: 2.50, parinaud: 'P4' },
    stereopsie: '100 sec d\'arc',
    ppc: '14 cm',
    examenLampeAFente: 'Opacification cristallinienne bilatérale - cataracte nucléaire. Conjonctive saine.',
    typeAnomalie: ['Presbytie', 'Hypermétropie', 'Pathologie suspectée'],
    actionEntreprise: 'Orientation vers ophtalmologiste',
    noteLibre: 'URGENT: Vision floue malgré correction. Cataracte probable. Orientation vers ophtalmologiste pour chirurgie.'
  },
  {
    nom: 'THIAM',
    prenom: 'Khady',
    age: 8,
    sexe: 'Femme',
    profession: 'Élève',
    motifConsultation: 'Contrôle de routine',
    antecedentsOculaires: 'Aucun',
    antecedentsSystemiques: 'Aucun',
    correctionActuelle: 'Non',
    puissanceVerresActuels: { od: '', og: '' },
    avsc: { od: '10/10', og: '5/10', bin: '10/10' },
    avcc: { od: '10/10', og: '8/10', bin: '10/10' },
    pio: { od: 12, og: 12 },
    motiliteOculaire: 'Restreinte',
    testIshihara: '38/38 Normal',
    refractionObjective: {
      od: { sphere: 0.00, cylindre: 0.00, axe: 0 },
      og: { sphere: 1.50, cylindre: 0.00, axe: 0 }
    },
    refractionSubjective: {
      od: { sphere: 0.00, cylindre: 0.00, axe: 0, acuiteFinale: '10/10' },
      og: { sphere: 1.50, cylindre: 0.00, axe: 0, acuiteFinale: '8/10' }
    },
    visionDePres: { addition: null, parinaud: 'P2' },
    stereopsie: '200 sec d\'arc',
    ppc: '12 cm',
    examenLampeAFente: 'Normal',
    typeAnomalie: ['Amblyopie'],
    actionEntreprise: 'Rééducation orthoptique',
    noteLibre: 'Amblyopie œil gauche. Lunettes + occlusion œil droit. Consultation ophtalmologique pédiatrique URGENTE.'
  }
];

// Fonction pour insérer les données
async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à MongoDB');

    const count = await BilanVisuel.countDocuments();
    console.log(`${count} bilan(s) existant(s) dans la base`);
    
    console.log('Insertion des données de test...');
    const result = await BilanVisuel.create(bilansTest);
    console.log(`${result.length} bilans de test insérés avec succès !`);

    const total = await BilanVisuel.countDocuments();
    const parSexe = await BilanVisuel.aggregate([
      { $group: { _id: '$sexe', count: { $sum: 1 } } }
    ]);
    
    console.log('\nRésumé de la base de données:');
    console.log(`   Total de bilans: ${total}`);
    parSexe.forEach(s => {
      console.log(`   ${s._id}: ${s.count}`);
    });

    await mongoose.disconnect();
    console.log('\nTerminé !');
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
}

seedDatabase();
