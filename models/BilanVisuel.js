const mongoose = require('mongoose');

const bilanVisuelSchema = new mongoose.Schema({
  // Informations du patient
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  sexe: {
    type: String,
    enum: ['Masculin', 'Féminin'],
    required: true
  },
  dateNaissance: {
    type: Date
  },
  telephone: {
    type: String
  },
  
  // Motif de consultation
  motifConsultation: {
    type: String,
    required: true
  },
  
  // Antécédents
  antecedentsMedicaux: {
    type: String
  },
  antecedentsOphtalmologiques: {
    type: String
  },
  
  // Acuité visuelle
  acuiteVisuelle: {
    oeilDroit: {
      loin: {
        sansCorrection: String,
        avecCorrection: String
      },
      pres: {
        sansCorrection: String,
        avecCorrection: String
      }
    },
    oeilGauche: {
      loin: {
        sansCorrection: String,
        avecCorrection: String
      },
      pres: {
        sansCorrection: String,
        avecCorrection: String
      }
    },
    binoculaire: {
      loin: String,
      pres: String
    }
  },
  
  // Réfraction
  refraction: {
    oeilDroit: {
      sphere: Number,
      cylindre: Number,
      axe: Number,
      addition: Number
    },
    oeilGauche: {
      sphere: Number,
      cylindre: Number,
      axe: Number,
      addition: Number
    }
  },
  
  // Tests complémentaires
  motiliteOculaire: {
    type: String,
    enum: ['Normal', 'Anormal', 'Non testé']
  },
  visionBinoculaire: {
    type: String,
    enum: ['Normal', 'Anormal', 'Non testé']
  },
  champVisuel: {
    type: String,
    enum: ['Normal', 'Anormal', 'Non testé']
  },
  testCouleur: {
    type: String,
    enum: ['Normal', 'Anormal', 'Non testé']
  },
  
  // Diagnostic et observations
  anomaliesDetectees: [{
    type: String
  }],
  diagnostic: {
    type: String
  },
  observations: {
    type: String
  },
  
  // Traitement et suivi
  prescription: {
    type: String
  },
  orientation: {
    type: String
  },
  
  // Informations administratives
  dateExamen: {
    type: Date,
    default: Date.now
  },
  examinateur: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BilanVisuel', bilanVisuelSchema);
