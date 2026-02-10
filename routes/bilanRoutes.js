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

// Helpers pour le CSV
function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const yyyy = dt.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function fmtRef(obj) {
  if (!obj) return '';
  const s = obj.sphere != null ? (obj.sphere >= 0 ? '+' : '') + obj.sphere.toFixed(2) : '';
  const c = obj.cylindre != null ? '(' + (obj.cylindre >= 0 ? '+' : '') + obj.cylindre.toFixed(2) + ')' : '';
  const a = obj.axe != null ? obj.axe + '°' : '';
  const parts = [s, c, a].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : '';
}

function v(val) { return val != null && val !== '' ? val : ''; }

// Exporter les bilans en CSV (must be before /:id)
// Supports query filters: sexe, nom, dateDebut, dateFin, anomalie
router.get('/export/csv', async (req, res) => {
  try {
    const { sexe, nom, dateDebut, dateFin, anomalie } = req.query;
    let filter = {};

    if (sexe) filter.sexe = sexe;
    if (nom) {
      filter.$or = [
        { nom: new RegExp(nom, 'i') },
        { prenom: new RegExp(nom, 'i') },
        { idPatient: new RegExp(nom, 'i') }
      ];
    }
    if (dateDebut || dateFin) {
      filter.dateExamen = {};
      if (dateDebut) filter.dateExamen.$gte = new Date(dateDebut);
      if (dateFin) filter.dateExamen.$lte = new Date(dateFin + 'T23:59:59');
    }
    if (anomalie) filter.typeAnomalie = anomalie;

    const bilans = await BilanVisuel.find(filter).sort({ dateExamen: -1 }).lean();
    
    if (bilans.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucun bilan à exporter'
      });
    }

    // Define explicit column order
    const fields = [
      'ID Patient', 'Date examen', 'Nom', 'Prénom', 'Sexe', 'Âge', 'Profession',
      'Motif consultation',
      'Antécédents oculaires', 'Antécédents systémiques',
      'Correction actuelle', 'Puissance verres OD', 'Puissance verres OG',
      'AVSC OD', 'AVSC OG', 'AVSC BIN',
      'AVCC OD', 'AVCC OG', 'AVCC BIN',
      'PIO OD (mmHg)', 'PIO OG (mmHg)',
      'Motilité oculaire', 'Test Ishihara',
      'Réfraction Obj. OD', 'Réfraction Obj. OG',
      'Réfraction Sub. OD', 'Acuité finale OD',
      'Réfraction Sub. OG', 'Acuité finale OG',
      'Addition', 'Parinaud',
      'Stéréopsie', 'PPC', 'Examen lampe à fente',
      'Type(s) anomalie', 'Action entreprise', 'Notes / Observations',
      'Créé le'
    ];
    
    const flattenedData = bilans.map(b => ({
      'ID Patient': v(b.idPatient),
      'Date examen': fmtDate(b.dateExamen),
      'Nom': v(b.nom),
      'Prénom': v(b.prenom),
      'Sexe': v(b.sexe),
      'Âge': b.age != null ? b.age : '',
      'Profession': v(b.profession),
      'Motif consultation': v(b.motifConsultation),
      // Anamnèse
      'Antécédents oculaires': v(b.antecedentsOculaires),
      'Antécédents systémiques': v(b.antecedentsSystemiques),
      'Correction actuelle': v(b.correctionActuelle),
      'Puissance verres OD': v(b.puissanceVerresActuels?.od),
      'Puissance verres OG': v(b.puissanceVerresActuels?.og),
      // Pré-tests
      'AVSC OD': v(b.avsc?.od),
      'AVSC OG': v(b.avsc?.og),
      'AVSC BIN': v(b.avsc?.bin),
      'AVCC OD': v(b.avcc?.od),
      'AVCC OG': v(b.avcc?.og),
      'AVCC BIN': v(b.avcc?.bin),
      'PIO OD (mmHg)': b.pio?.od != null ? b.pio.od : '',
      'PIO OG (mmHg)': b.pio?.og != null ? b.pio.og : '',
      'Motilité oculaire': v(b.motiliteOculaire),
      'Test Ishihara': v(b.testIshihara),
      // Réfraction — formatted as combined notation
      'Réfraction Obj. OD': fmtRef(b.refractionObjective?.od),
      'Réfraction Obj. OG': fmtRef(b.refractionObjective?.og),
      'Réfraction Sub. OD': fmtRef(b.refractionSubjective?.od),
      'Acuité finale OD': v(b.refractionSubjective?.od?.acuiteFinale),
      'Réfraction Sub. OG': fmtRef(b.refractionSubjective?.og),
      'Acuité finale OG': v(b.refractionSubjective?.og?.acuiteFinale),
      'Addition': b.visionDePres?.addition != null ? '+' + b.visionDePres.addition.toFixed(2) : '',
      'Parinaud': v(b.visionDePres?.parinaud),
      // Vision binoculaire
      'Stéréopsie': v(b.stereopsie),
      'PPC': v(b.ppc),
      'Examen lampe à fente': v(b.examenLampeAFente),
      // Diagnostic
      'Type(s) anomalie': b.typeAnomalie?.length > 0 ? b.typeAnomalie.join(' ; ') : '',
      'Action entreprise': v(b.actionEntreprise),
      'Notes / Observations': v(b.noteLibre),
      'Créé le': fmtDate(b.createdAt)
    }));
    
    const parser = new Parser({ fields, delimiter: ';', withBOM: true });
    const csv = parser.parse(flattenedData);

    // Build readable filename
    const today = new Date();
    const fileDateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    let fileName = `bilans_BBA_${fileDateStr}`;
    if (dateDebut || dateFin) {
      fileName += `_du_${dateDebut || 'debut'}_au_${dateFin || 'fin'}`;
    }
    fileName += `.csv`;
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(csv);
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
