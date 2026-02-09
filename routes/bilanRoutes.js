const express = require('express');
const router = express.Router();
const BilanVisuel = require('../models/BilanVisuel');
const { Parser } = require('json2csv');

// Créer un nouveau bilan
router.post('/', async (req, res) => {
  try {
    const bilan = new BilanVisuel(req.body);
    await bilan.save();
    res.status(201).json({
      success: true,
      message: 'Bilan enregistré avec succès',
      data: bilan
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement du bilan',
      error: error.message
    });
  }
});

// Récupérer tous les bilans
router.get('/', async (req, res) => {
  try {
    const { age, sexe, motif, dateDebut, dateFin } = req.query;
    let filter = {};
    
    if (age) filter.age = parseInt(age);
    if (sexe) filter.sexe = sexe;
    if (motif) filter.motifConsultation = new RegExp(motif, 'i');
    
    if (dateDebut || dateFin) {
      filter.dateExamen = {};
      if (dateDebut) filter.dateExamen.$gte = new Date(dateDebut);
      if (dateFin) filter.dateExamen.$lte = new Date(dateFin);
    }
    
    const bilans = await BilanVisuel.find(filter).sort({ dateExamen: -1 });
    res.json({
      success: true,
      count: bilans.length,
      data: bilans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des bilans',
      error: error.message
    });
  }
});

// Récupérer un bilan par ID
router.get('/:id', async (req, res) => {
  try {
    const bilan = await BilanVisuel.findById(req.params.id);
    if (!bilan) {
      return res.status(404).json({
        success: false,
        message: 'Bilan non trouvé'
      });
    }
    res.json({
      success: true,
      data: bilan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du bilan',
      error: error.message
    });
  }
});

// Mettre à jour un bilan
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
        message: 'Bilan non trouvé'
      });
    }
    res.json({
      success: true,
      message: 'Bilan mis à jour avec succès',
      data: bilan
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour du bilan',
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
        message: 'Bilan non trouvé'
      });
    }
    res.json({
      success: true,
      message: 'Bilan supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du bilan',
      error: error.message
    });
  }
});

// Exporter les bilans en CSV
router.get('/export/csv', async (req, res) => {
  try {
    const bilans = await BilanVisuel.find().lean();
    
    if (bilans.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucun bilan à exporter'
      });
    }
    
    // Aplatir les données pour le CSV
    const flattenedData = bilans.map(bilan => ({
      ID: bilan._id,
      Nom: bilan.nom,
      Prénom: bilan.prenom,
      Âge: bilan.age,
      Sexe: bilan.sexe,
      Téléphone: bilan.telephone,
      'Date examen': bilan.dateExamen,
      'Motif consultation': bilan.motifConsultation,
      'Antécédents médicaux': bilan.antecedentsMedicaux,
      'Antécédents ophtalmo': bilan.antecedentsOphtalmologiques,
      'AV OD loin SC': bilan.acuiteVisuelle?.oeilDroit?.loin?.sansCorrection,
      'AV OD loin AC': bilan.acuiteVisuelle?.oeilDroit?.loin?.avecCorrection,
      'AV OD près SC': bilan.acuiteVisuelle?.oeilDroit?.pres?.sansCorrection,
      'AV OD près AC': bilan.acuiteVisuelle?.oeilDroit?.pres?.avecCorrection,
      'AV OG loin SC': bilan.acuiteVisuelle?.oeilGauche?.loin?.sansCorrection,
      'AV OG loin AC': bilan.acuiteVisuelle?.oeilGauche?.loin?.avecCorrection,
      'AV OG près SC': bilan.acuiteVisuelle?.oeilGauche?.pres?.sansCorrection,
      'AV OG près AC': bilan.acuiteVisuelle?.oeilGauche?.pres?.avecCorrection,
      'Sphère OD': bilan.refraction?.oeilDroit?.sphere,
      'Cylindre OD': bilan.refraction?.oeilDroit?.cylindre,
      'Axe OD': bilan.refraction?.oeilDroit?.axe,
      'Addition OD': bilan.refraction?.oeilDroit?.addition,
      'Sphère OG': bilan.refraction?.oeilGauche?.sphere,
      'Cylindre OG': bilan.refraction?.oeilGauche?.cylindre,
      'Axe OG': bilan.refraction?.oeilGauche?.axe,
      'Addition OG': bilan.refraction?.oeilGauche?.addition,
      'Motilité oculaire': bilan.motiliteOculaire,
      'Vision binoculaire': bilan.visionBinoculaire,
      'Champ visuel': bilan.champVisuel,
      'Test couleur': bilan.testCouleur,
      'Anomalies détectées': bilan.anomaliesDetectees?.join('; '),
      Diagnostic: bilan.diagnostic,
      Observations: bilan.observations,
      Prescription: bilan.prescription,
      Orientation: bilan.orientation,
      Examinateur: bilan.examinateur
    }));
    
    const parser = new Parser();
    const csv = parser.parse(flattenedData);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=bilans_visuels_${Date.now()}.csv`);
    res.send('\ufeff' + csv); // BOM pour Excel UTF-8
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'export CSV',
      error: error.message
    });
  }
});

// Statistiques
router.get('/stats/overview', async (req, res) => {
  try {
    const totalBilans = await BilanVisuel.countDocuments();
    
    const parSexe = await BilanVisuel.aggregate([
      { $group: { _id: '$sexe', count: { $sum: 1 } } }
    ]);
    
    const parAge = await BilanVisuel.aggregate([
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [0, 18, 30, 45, 60, 100],
          default: 'Autre',
          output: { count: { $sum: 1 } }
        }
      }
    ]);
    
    const anomaliesFrequentes = await BilanVisuel.aggregate([
      { $unwind: '$anomaliesDetectees' },
      { $group: { _id: '$anomaliesDetectees', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      success: true,
      data: {
        totalBilans,
        parSexe,
        parAge,
        anomaliesFrequentes
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

module.exports = router;
