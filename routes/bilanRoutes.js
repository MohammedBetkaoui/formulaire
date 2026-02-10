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

// Statistiques (must be before /:id)
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
      { $unwind: '$typeAnomalie' },
      { $group: { _id: '$typeAnomalie', count: { $sum: 1 } } },
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

// Exporter les bilans en CSV (must be before /:id)
router.get('/export/csv', async (req, res) => {
  try {
    const bilans = await BilanVisuel.find().lean();
    
    if (bilans.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucun bilan à exporter'
      });
    }
    
    const flattenedData = bilans.map(bilan => ({
      'ID Patient': bilan.idPatient,
      'Date examen': bilan.dateExamen ? new Date(bilan.dateExamen).toLocaleDateString('fr-FR') : '',
      Nom: bilan.nom,
      Prénom: bilan.prenom,
      Sexe: bilan.sexe,
      Âge: bilan.age,
      Profession: bilan.profession,
      'Motif consultation': bilan.motifConsultation,
      // Anamnèse
      'Antécédents oculaires': bilan.antecedentsOculaires,
      'Antécédents systémiques': bilan.antecedentsSystemiques,
      'Correction actuelle': bilan.correctionActuelle,
      'Puissance OD': bilan.puissanceVerresActuels?.od,
      'Puissance OG': bilan.puissanceVerresActuels?.og,
      // Pré-tests
      'AVSC OD': bilan.avsc?.od,
      'AVSC OG': bilan.avsc?.og,
      'AVSC BIN': bilan.avsc?.bin,
      'AVCC OD': bilan.avcc?.od,
      'AVCC OG': bilan.avcc?.og,
      'AVCC BIN': bilan.avcc?.bin,
      'PIO OD': bilan.pio?.od,
      'PIO OG': bilan.pio?.og,
      'Motilité': bilan.motiliteOculaire,
      'Ishihara': bilan.testIshihara,
      // Réfraction Objective
      'Réf Obj OD Sph': bilan.refractionObjective?.od?.sphere,
      'Réf Obj OD Cyl': bilan.refractionObjective?.od?.cylindre,
      'Réf Obj OD Axe': bilan.refractionObjective?.od?.axe,
      'Réf Obj OG Sph': bilan.refractionObjective?.og?.sphere,
      'Réf Obj OG Cyl': bilan.refractionObjective?.og?.cylindre,
      'Réf Obj OG Axe': bilan.refractionObjective?.og?.axe,
      // Réfraction Subjective
      'Réf Sub OD Sph': bilan.refractionSubjective?.od?.sphere,
      'Réf Sub OD Cyl': bilan.refractionSubjective?.od?.cylindre,
      'Réf Sub OD Axe': bilan.refractionSubjective?.od?.axe,
      'Acuité finale OD': bilan.refractionSubjective?.od?.acuiteFinale,
      'Réf Sub OG Sph': bilan.refractionSubjective?.og?.sphere,
      'Réf Sub OG Cyl': bilan.refractionSubjective?.og?.cylindre,
      'Réf Sub OG Axe': bilan.refractionSubjective?.og?.axe,
      'Acuité finale OG': bilan.refractionSubjective?.og?.acuiteFinale,
      'Addition': bilan.visionDePres?.addition,
      'Parinaud': bilan.visionDePres?.parinaud,
      // Vision binoculaire
      'Stéréopsie': bilan.stereopsie,
      'PPC': bilan.ppc,
      'Lampe à fente': bilan.examenLampeAFente,
      // Diagnostic
      'Type anomalie': bilan.typeAnomalie?.join('; '),
      'Action entreprise': bilan.actionEntreprise,
      'Notes': bilan.noteLibre
    }));
    
    const parser = new Parser();
    const csv = parser.parse(flattenedData);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=bilans_visuels_${Date.now()}.csv`);
    res.send('\ufeff' + csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'export CSV',
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

module.exports = router;
