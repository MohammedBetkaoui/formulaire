const express = require('express');
const router = express.Router();
const BilanVisuel = require('../models/BilanVisuel');
const { Parser } = require('json2csv');

// Creer un nouveau bilan
router.post('/', async (req, res) => {
  try {
    const bilan = new BilanVisuel(req.body);
    await bilan.save();
    res.status(201).json({
      success: true,
      message: 'Bilan enregistre avec succes',
      data: bilan
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erreur lors de l'enregistrement du bilan",
      error: error.message
    });
  }
});

// Statistiques (must be before /:id)
router.get('/stats/overview', async (req, res) => {
  try {
    const totalBilans = await BilanVisuel.countDocuments();

    const parSexe = await BilanVisuel.aggregate([
      { $group: { _id: '$sexe', count: { $sum: 1 } } }
    ]);

    const parStatutRefractif = await BilanVisuel.aggregate([
      { $match: { statut_refractif: { $ne: null, $ne: '' } } },
      { $group: { _id: '$statut_refractif', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalBilans,
        parSexe,
        parStatutRefractif
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul des statistiques',
      error: error.message
    });
  }
});

// Helpers pour le CSV
function v(val) { return val != null && val !== '' ? val : ''; }
function vn(val) { return val != null ? val : ''; }

const AMETROPIE_EXPORT_OPTIONS = [
  { label: 'Myopie', column: 'ametropie_myopie' },
  { label: 'Hypermetropie', column: 'ametropie_hypermetropie' },
  { label: 'Astigmatisme', column: 'ametropie_astigmatisme' }
];

const ANOMALIES_EXPORT_OPTIONS = [
  { label: "Insuffisance d'accommodation", column: 'anomalie_insuffisance_accommodation' },
  { label: "Exces d'accommodation", column: 'anomalie_exces_accommodation' },
  { label: 'Fatigue accommodative', column: 'anomalie_fatigue_accommodative' },
  { label: 'Spasme accommodatif', column: 'anomalie_spasme_accommodatif' },
  { label: 'Inertie accommodative', column: 'anomalie_inertie_accommodative' },
  { label: 'Insuffisance de convergence', column: 'anomalie_insuffisance_convergence' },
  { label: 'Pseudo-insuffisance de convergence', column: 'anomalie_pseudo_insuffisance_convergence' },
  { label: 'Exces de convergence', column: 'anomalie_exces_convergence' },
  { label: 'Esophorie basique', column: 'anomalie_esophorie_basique' },
  { label: 'Insuffisance de divergence', column: 'anomalie_insuffisance_divergence' },
  { label: 'Exophorie basique', column: 'anomalie_exophorie_basique' },
  { label: 'Exces de divergence', column: 'anomalie_exces_divergence' },
  { label: 'Phorie verticale', column: 'anomalie_phorie_verticale' },
  { label: 'Dysfonctionnement vergentiel', column: 'anomalie_dysfonctionnement_vergentiel' },
  { label: 'Reserves fusionnelles reduites', column: 'anomalie_reserves_fusionnelles_reduites' },
  { label: "Pas d'anomalie", column: 'anomalie_pas_d_anomalie' }
];

const CSV_VALUE_ALIASES = {
  aucune: 'pas d anomalie'
};

function normalizeCsvChoice(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\'\`\u2019]/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function parseCsvChoices(rawValue) {
  if (rawValue == null || rawValue === '') return new Set();

  const source = Array.isArray(rawValue) ? rawValue.join(',') : String(rawValue);

  return new Set(
    source
      .split(/[;,]/)
      .map(part => normalizeCsvChoice(part))
      .filter(Boolean)
      .map(choice => CSV_VALUE_ALIASES[choice] || choice)
  );
}

function hasCsvChoice(choices, label) {
  const normalizedLabel = normalizeCsvChoice(label);
  const resolvedLabel = CSV_VALUE_ALIASES[normalizedLabel] || normalizedLabel;
  return choices.has(resolvedLabel);
}

// Exporter les bilans en CSV (must be before /:id)
router.get('/export/csv', async (req, res) => {
  try {
    const { sexe, dateDebut, dateFin } = req.query;
    let filter = {};

    if (sexe) filter.sexe = sexe;
    if (dateDebut || dateFin) {
      filter.createdAt = {};
      if (dateDebut) filter.createdAt.$gte = new Date(dateDebut);
      if (dateFin) filter.createdAt.$lte = new Date(dateFin + 'T23:59:59');
    }

    const bilans = await BilanVisuel.find(filter).sort({ createdAt: -1 }).lean();

    if (bilans.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucun bilan a exporter'
      });
    }

    const fields = [
      'age',
      'sexe',
      'ametropie',
      'anomalies',
      'acuite_visuelle',
      'statut_refractif',
      ...AMETROPIE_EXPORT_OPTIONS.map(option => option.column),
      ...ANOMALIES_EXPORT_OPTIONS.map(option => option.column)
    ];

    const flattenedData = bilans.map((bilan) => {
      const ametropieChoices = parseCsvChoices(bilan.ametropie);
      const anomaliesChoices = parseCsvChoices(bilan.anomalies);

      const row = {
        age: vn(bilan.age),
        sexe: v(bilan.sexe),
        ametropie: v(bilan.ametropie),
        anomalies: v(bilan.anomalies),
        acuite_visuelle: v(bilan.acuite_visuelle),
        statut_refractif: v(bilan.statut_refractif)
      };

      AMETROPIE_EXPORT_OPTIONS.forEach((option) => {
        row[option.column] = hasCsvChoice(ametropieChoices, option.label) ? 1 : 0;
      });

      ANOMALIES_EXPORT_OPTIONS.forEach((option) => {
        row[option.column] = hasCsvChoice(anomaliesChoices, option.label) ? 1 : 0;
      });

      return row;
    });

    const parser = new Parser({ fields, delimiter: ';', withBOM: true });
    const csv = parser.parse(flattenedData);

    const today = new Date();
    const fileDateStr = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0');
    let fileName = 'bilans_BBA_' + fileDateStr;
    if (dateDebut || dateFin) {
      fileName += '_du_' + (dateDebut || 'debut') + '_au_' + (dateFin || 'fin');
    }
    fileName += '.csv';

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="' + fileName + '"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'export CSV",
      error: error.message
    });
  }
});

// Recuperer tous les bilans
router.get('/', async (req, res) => {
  try {
    const { sexe, dateDebut, dateFin } = req.query;
    let filter = {};

    if (sexe) filter.sexe = sexe;

    if (dateDebut || dateFin) {
      filter.createdAt = {};
      if (dateDebut) filter.createdAt.$gte = new Date(dateDebut);
      if (dateFin) filter.createdAt.$lte = new Date(dateFin);
    }

    const bilans = await BilanVisuel.find(filter).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: bilans.length,
      data: bilans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation des bilans',
      error: error.message
    });
  }
});

// Recuperer un bilan par ID
router.get('/:id', async (req, res) => {
  try {
    const bilan = await BilanVisuel.findById(req.params.id);
    if (!bilan) {
      return res.status(404).json({
        success: false,
        message: 'Bilan non trouve'
      });
    }
    res.json({
      success: true,
      data: bilan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation du bilan',
      error: error.message
    });
  }
});

// Mettre a jour un bilan
router.put('/:id', async (req, res) => {
  try {
    const bilan = await BilanVisuel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!bilan) {
      return res.status(404).json({
        success: false,
        message: 'Bilan non trouve'
      });
    }
    res.json({
      success: true,
      message: 'Bilan mis a jour avec succes',
      data: bilan
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise a jour du bilan',
      error: error.message
    });
  }
});

// Supprimer un bilan
router.delete('/:id', async (req, res) => {
  try {
    const bilan = await BilanVisuel.findByIdAndDelete(req.params.id);
    if (!bilan) {
      return res.status(404).json({
        success: false,
        message: 'Bilan non trouve'
      });
    }
    res.json({
      success: true,
      message: 'Bilan supprime avec succes'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du bilan',
      error: error.message
    });
  }
});

module.exports = router;
