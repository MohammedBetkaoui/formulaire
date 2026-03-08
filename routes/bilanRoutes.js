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

    const fields = ['age', 'sexe', 'ametropie', 'anomalies', 'acuite_visuelle', 'statut_refractif'];

    const flattenedData = bilans.map(b => ({
      age: vn(b.age),
      sexe: v(b.sexe),
      ametropie: v(b.ametropie),
      anomalies: v(b.anomalies),
      acuite_visuelle: v(b.acuite_visuelle),
      statut_refractif: v(b.statut_refractif)
    }));

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
