const mongoose = require('mongoose');

const bilanVisuelSchema = new mongoose.Schema({
  age: { type: Number, required: true },
  sexe: { type: String, enum: ['Homme', 'Femme', ''], default: '' },
  ametropie: { type: String },
  anomalies: { type: String },
  acuite_visuelle: { type: String },
  statut_refractif: { type: String, enum: ['Emmetrope', 'Non emmetrope', ''], default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('BilanVisuel', bilanVisuelSchema);
