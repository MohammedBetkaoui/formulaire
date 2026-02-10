const mongoose = require('mongoose');

const bilanVisuelSchema = new mongoose.Schema({
  // ===== 1. IDENTIFICATION DU PATIENT & CONTEXTE =====
  // تعريف المريض والسياق
  idPatient: {
    type: String,
    unique: true
  },
  dateExamen: {
    type: Date,
    default: Date.now
  },
  sexe: {
    type: String,
    enum: ['Homme', 'Femme'],
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  profession: {
    type: String
  },
  motifConsultation: {
    type: String,
    required: true
  },

  // ===== 2. ANAMNÈSE (ANTÉCÉDENTS) =====
  // السوابق المرضية
  antecedentsOculaires: {
    type: String
  },
  antecedentsSystemiques: {
    type: String
  },
  correctionActuelle: {
    type: String,
    enum: ['Oui', 'Non'],
    default: 'Non'
  },
  puissanceVerresActuels: {
    od: { type: String },
    og: { type: String }
  },

  // ===== 3. PRÉ-TESTS & SANTÉ OCULAIRE =====
  // الفحوصات الأولية وصحة العين
  avsc: {
    od: { type: String },
    og: { type: String },
    bin: { type: String }
  },
  avcc: {
    od: { type: String },
    og: { type: String },
    bin: { type: String }
  },
  pio: {
    od: { type: Number },
    og: { type: Number }
  },
  motiliteOculaire: {
    type: String,
    enum: ['Normale', 'Restreinte', 'Douleur', ''],
    default: ''
  },
  testIshihara: {
    type: String
  },

  // ===== 4. RÉFRACTION =====
  // قياس انكسار الضوء
  refractionObjective: {
    od: {
      sphere: { type: Number },
      cylindre: { type: Number },
      axe: { type: Number }
    },
    og: {
      sphere: { type: Number },
      cylindre: { type: Number },
      axe: { type: Number }
    }
  },
  refractionSubjective: {
    od: {
      sphere: { type: Number },
      cylindre: { type: Number },
      axe: { type: Number },
      acuiteFinale: { type: String }
    },
    og: {
      sphere: { type: Number },
      cylindre: { type: Number },
      axe: { type: Number },
      acuiteFinale: { type: String }
    }
  },
  visionDePres: {
    addition: { type: Number },
    parinaud: { type: String }
  },

  // ===== 5. VISION BINOCULAIRE & SANTÉ DU SEGMENT =====
  // الرؤية المزدوجة وصحة القطاع
  stereopsie: {
    type: String
  },
  ppc: {
    type: String
  },
  examenLampeAFente: {
    type: String
  },

  // ===== 6. DIAGNOSTIC ET DÉCISION (Classification BBA) =====
  // التشخيص والقرار
  typeAnomalie: [{
    type: String
  }],
  actionEntreprise: {
    type: String
  },
  noteLibre: {
    type: String
  }
}, {
  timestamps: true
});

// Auto-génération de l'ID patient
bilanVisuelSchema.pre('save', async function(next) {
  if (!this.idPatient) {
    const count = await mongoose.model('BilanVisuel').countDocuments();
    const year = new Date().getFullYear();
    this.idPatient = `BBA-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('BilanVisuel', bilanVisuelSchema);
