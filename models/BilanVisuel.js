const mongoose = require('mongoose');

const bilanVisuelSchema = new mongoose.Schema({
  // ===== 1. IDENTIFICATION PATIENT (7 champs) =====
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  date_naissance: { type: Date },
  sexe: { type: String, enum: ['Homme', 'Femme', ''], default: '' },
  telephone: { type: String },
  email: { type: String },
  ville: { type: String },

  // ===== 2. ANAMNÈSE & CONTEXTE (4 champs) =====
  motif_consultation: { type: String },
  antecedents_oculaires: { type: String },
  antecedents_generaux: { type: String },
  port_actuel: { type: String },

  // ===== 3. ACUITÉ VISUELLE (5 champs) =====
  av_od_sc: { type: String },
  av_og_sc: { type: String },
  av_od_ac: { type: String },
  av_og_ac: { type: String },
  av_binoculaire: { type: String },

  // ===== 4. AUTORÉFRACTOMÈTRE OD (3 champs) =====
  auto_od_sphere: { type: Number },
  auto_od_cylindre: { type: Number },
  auto_od_axe: { type: Number },

  // ===== 5. AUTORÉFRACTOMÈTRE OG (3 champs) =====
  auto_og_sphere: { type: Number },
  auto_og_cylindre: { type: Number },
  auto_og_axe: { type: Number },

  // ===== 6. RÉFRACTION SUBJECTIVE OD (4 champs) =====
  rx_od_sphere: { type: Number },
  rx_od_cylindre: { type: Number },
  rx_od_axe: { type: Number },
  rx_od_addition: { type: Number },

  // ===== 7. RÉFRACTION SUBJECTIVE OG (4 champs) =====
  rx_og_sphere: { type: Number },
  rx_og_cylindre: { type: Number },
  rx_og_axe: { type: Number },
  rx_og_addition: { type: Number },

  // ===== 8. DIAMÈTRE PUPILLAIRE (3 champs) =====
  dp_od: { type: Number },
  dp_og: { type: Number },
  dp_binoculaire: { type: Number },

  // ===== 9. PRESSION INTRAOCULAIRE (2 champs) =====
  pio_od: { type: Number },
  pio_og: { type: Number },

  // ===== 10. DIAGNOSTIC & SUIVI (3 champs) =====
  diagnostic: { type: String },
  observations: { type: String },
  praticien: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('BilanVisuel', bilanVisuelSchema);
