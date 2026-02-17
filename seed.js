require('dotenv').config();
const mongoose = require('mongoose');
const BilanVisuel = require('./models/BilanVisuel');

// Données de test — 38 champs CSV
const bilansTest = [
  {
    nom: 'DIALLO', prenom: 'Amadou',
    date_naissance: new Date('1998-03-15'), sexe: 'Homme',
    telephone: '0555 123 456', email: 'amadou.diallo@email.com', ville: 'Alger',
    motif_consultation: 'Baisse d\'acuité',
    antecedents_oculaires: 'Aucun',
    antecedents_generaux: 'Aucun',
    port_actuel: 'Rien',
    av_od_sc: '5/10', av_og_sc: '4/10',
    av_od_ac: '10/10', av_og_ac: '10/10', av_binoculaire: '10/10',
    auto_od_sphere: -2.00, auto_od_cylindre: -0.50, auto_od_axe: 90,
    auto_og_sphere: -2.25, auto_og_cylindre: -0.75, auto_og_axe: 85,
    rx_od_sphere: -1.75, rx_od_cylindre: -0.50, rx_od_axe: 90, rx_od_addition: null,
    rx_og_sphere: -2.00, rx_og_cylindre: -0.75, rx_og_axe: 85, rx_og_addition: null,
    dp_od: 32, dp_og: 31.5, dp_binoculaire: 63.5,
    pio_od: 14, pio_og: 15,
    diagnostic: 'Myopie avec astigmatisme',
    observations: 'Fatigue visuelle liée au travail sur écran. Première consultation.',
    praticien: 'Dr. Benali'
  },
  {
    nom: 'KANE', prenom: 'Fatou',
    date_naissance: new Date('1974-07-22'), sexe: 'Femme',
    telephone: '0661 234 567', email: 'fatou.kane@email.com', ville: 'Oran',
    motif_consultation: 'Vision floue de près',
    antecedents_oculaires: 'Aucun',
    antecedents_generaux: 'Hypertension',
    port_actuel: 'Rien',
    av_od_sc: '10/10', av_og_sc: '10/10',
    av_od_ac: '10/10', av_og_ac: '10/10', av_binoculaire: '10/10',
    auto_od_sphere: 0.00, auto_od_cylindre: 0.00, auto_od_axe: 0,
    auto_og_sphere: 0.00, auto_og_cylindre: 0.00, auto_og_axe: 0,
    rx_od_sphere: 0.00, rx_od_cylindre: 0.00, rx_od_axe: 0, rx_od_addition: 2.00,
    rx_og_sphere: 0.00, rx_og_cylindre: 0.00, rx_og_axe: 0, rx_og_addition: 2.00,
    dp_od: 30, dp_og: 30, dp_binoculaire: 60,
    pio_od: 16, pio_og: 17,
    diagnostic: 'Presbytie',
    observations: 'Début de presbytie typique. Lunettes de lecture +2.00.',
    praticien: 'Dr. Benali'
  },
  {
    nom: 'NDIAYE', prenom: 'Ibrahima',
    date_naissance: new Date('2008-01-10'), sexe: 'Homme',
    telephone: '0770 345 678', email: '', ville: 'Constantine',
    motif_consultation: 'Contrôle de routine',
    antecedents_oculaires: 'Aucun',
    antecedents_generaux: 'Aucun',
    port_actuel: 'Rien',
    av_od_sc: '10/10', av_og_sc: '10/10',
    av_od_ac: '10/10', av_og_ac: '10/10', av_binoculaire: '10/10',
    auto_od_sphere: 0.00, auto_od_cylindre: 0.00, auto_od_axe: 0,
    auto_og_sphere: 0.00, auto_og_cylindre: 0.00, auto_og_axe: 0,
    rx_od_sphere: 0.00, rx_od_cylindre: 0.00, rx_od_axe: 0, rx_od_addition: null,
    rx_og_sphere: 0.00, rx_og_cylindre: 0.00, rx_og_axe: 0, rx_og_addition: null,
    dp_od: 29, dp_og: 29, dp_binoculaire: 58,
    pio_od: 13, pio_og: 13,
    diagnostic: 'Emmétrope - vision normale',
    observations: 'Vision normale. Contrôle dans 2 ans.',
    praticien: 'Dr. Mekhloufi'
  },
  {
    nom: 'SOW', prenom: 'Aissatou',
    date_naissance: new Date('1991-11-05'), sexe: 'Femme',
    telephone: '0555 456 789', email: 'aissatou.sow@email.com', ville: 'Alger',
    motif_consultation: 'Céphalées',
    antecedents_oculaires: 'Aucun',
    antecedents_generaux: 'Migraines',
    port_actuel: 'Rien',
    av_od_sc: '8/10', av_og_sc: '7/10',
    av_od_ac: '10/10', av_og_ac: '10/10', av_binoculaire: '10/10',
    auto_od_sphere: 0.50, auto_od_cylindre: -0.25, auto_od_axe: 180,
    auto_og_sphere: 0.75, auto_og_cylindre: -0.50, auto_og_axe: 175,
    rx_od_sphere: 0.50, rx_od_cylindre: -0.25, rx_od_axe: 180, rx_od_addition: null,
    rx_og_sphere: 0.75, rx_og_cylindre: -0.50, rx_og_axe: 175, rx_og_addition: null,
    dp_od: 30.5, dp_og: 30, dp_binoculaire: 60.5,
    pio_od: 15, pio_og: 14,
    diagnostic: 'Hypermétropie avec astigmatisme',
    observations: 'Céphalées liées à la fatigue visuelle. Lunettes de repos prescrites.',
    praticien: 'Dr. Benali'
  },
  {
    nom: 'BA', prenom: 'Moussa',
    date_naissance: new Date('2014-06-20'), sexe: 'Homme',
    telephone: '0661 567 890', email: '', ville: 'Annaba',
    motif_consultation: 'Baisse d\'acuité',
    antecedents_oculaires: 'Aucun',
    antecedents_generaux: 'Aucun',
    port_actuel: 'Rien',
    av_od_sc: '3/10', av_og_sc: '3/10',
    av_od_ac: '10/10', av_og_ac: '10/10', av_binoculaire: '10/10',
    auto_od_sphere: -3.50, auto_od_cylindre: 0.00, auto_od_axe: 0,
    auto_og_sphere: -3.75, auto_og_cylindre: 0.00, auto_og_axe: 0,
    rx_od_sphere: -3.50, rx_od_cylindre: 0.00, rx_od_axe: 0, rx_od_addition: null,
    rx_og_sphere: -3.75, rx_og_cylindre: 0.00, rx_og_axe: 0, rx_og_addition: null,
    dp_od: 28, dp_og: 28, dp_binoculaire: 56,
    pio_od: 12, pio_og: 12,
    diagnostic: 'Myopie',
    observations: 'Enfant ne voyant pas le tableau. Lunettes de correction permanente. Contrôle tous les 6 mois.',
    praticien: 'Dr. Mekhloufi'
  },
  {
    nom: 'DIOP', prenom: 'Mariama',
    date_naissance: new Date('1981-04-12'), sexe: 'Femme',
    telephone: '0770 678 901', email: 'mariama.diop@email.com', ville: 'Oran',
    motif_consultation: 'Renouvellement de lunettes',
    antecedents_oculaires: 'Myopie depuis l\'enfance',
    antecedents_generaux: 'Diabète type 2',
    port_actuel: 'Lunettes -4.00 (-0.50) 85° / -4.25 (-0.75) 90°',
    av_od_sc: '2/10', av_og_sc: '2/10',
    av_od_ac: '10/10', av_og_ac: '10/10', av_binoculaire: '10/10',
    auto_od_sphere: -4.50, auto_od_cylindre: -0.75, auto_od_axe: 85,
    auto_og_sphere: -4.75, auto_og_cylindre: -1.00, auto_og_axe: 90,
    rx_od_sphere: -4.50, rx_od_cylindre: -0.75, rx_od_axe: 85, rx_od_addition: 1.50,
    rx_og_sphere: -4.75, rx_og_cylindre: -1.00, rx_og_axe: 90, rx_og_addition: 1.50,
    dp_od: 31, dp_og: 31, dp_binoculaire: 62,
    pio_od: 18, pio_og: 17,
    diagnostic: 'Myopie, astigmatisme, début de presbytie',
    observations: 'Diabétique - surveillance rétinienne recommandée. Verres progressifs prescrits.',
    praticien: 'Dr. Benali'
  },
  {
    nom: 'SARR', prenom: 'Alioune',
    date_naissance: new Date('1958-09-03'), sexe: 'Homme',
    telephone: '0555 789 012', email: '', ville: 'Blida',
    motif_consultation: 'Baisse d\'acuité',
    antecedents_oculaires: 'Cataracte suspectée',
    antecedents_generaux: 'Hypertension, cholestérol',
    port_actuel: 'Lunettes progressives',
    av_od_sc: '4/10', av_og_sc: '3/10',
    av_od_ac: '6/10', av_og_ac: '5/10', av_binoculaire: '6/10',
    auto_od_sphere: 1.00, auto_od_cylindre: -0.50, auto_od_axe: 90,
    auto_og_sphere: 1.25, auto_og_cylindre: -0.75, auto_og_axe: 95,
    rx_od_sphere: 1.00, rx_od_cylindre: -0.50, rx_od_axe: 90, rx_od_addition: 2.50,
    rx_og_sphere: 1.25, rx_og_cylindre: -0.75, rx_og_axe: 95, rx_og_addition: 2.50,
    dp_od: 32, dp_og: 32, dp_binoculaire: 64,
    pio_od: 19, pio_og: 20,
    diagnostic: 'Presbytie, hypermétropie, cataracte suspectée',
    observations: 'URGENT: Vision floue malgré correction. Cataracte probable. Orientation vers ophtalmologiste.',
    praticien: 'Dr. Mekhloufi'
  },
  {
    nom: 'THIAM', prenom: 'Khady',
    date_naissance: new Date('2018-02-28'), sexe: 'Femme',
    telephone: '0661 890 123', email: '', ville: 'Alger',
    motif_consultation: 'Contrôle de routine',
    antecedents_oculaires: 'Aucun',
    antecedents_generaux: 'Aucun',
    port_actuel: 'Rien',
    av_od_sc: '10/10', av_og_sc: '5/10',
    av_od_ac: '10/10', av_og_ac: '8/10', av_binoculaire: '10/10',
    auto_od_sphere: 0.00, auto_od_cylindre: 0.00, auto_od_axe: 0,
    auto_og_sphere: 1.50, auto_og_cylindre: 0.00, auto_og_axe: 0,
    rx_od_sphere: 0.00, rx_od_cylindre: 0.00, rx_od_axe: 0, rx_od_addition: null,
    rx_og_sphere: 1.50, rx_og_cylindre: 0.00, rx_og_axe: 0, rx_og_addition: null,
    dp_od: 26, dp_og: 26, dp_binoculaire: 52,
    pio_od: 12, pio_og: 12,
    diagnostic: 'Amblyopie œil gauche',
    observations: 'Amblyopie OG. Lunettes + occlusion OD. Consultation ophtalmologique pédiatrique URGENTE.',
    praticien: 'Dr. Benali'
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
    
    console.log('\nRésumé de la base de données:');
    console.log(`   Total de bilans: ${total}`);

    await mongoose.disconnect();
    console.log('\nTerminé !');
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
}

seedDatabase();
