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
    
    const parVille = await BilanVisuel.aggregate([
      { $match: { ville: { $ne: null, $ne: '' } } },
      { $group: { _id: '$ville', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      success: true,
      data: {
        totalBilans,
        parSexe,
        parVille
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

function v(val) { return val != null && val !== '' ? val : ''; }
function vn(val) { return val != null ? val : ''; }

// Exporter les bilans en CSV (must be before /:id)
router.get('/export/csv', async (req, res) => {
  try {
    const { sexe, nom, dateDebut, dateFin } = req.query;
    let filter = {};

    if (sexe) filter.sexe = sexe;
    if (nom) {
      filter.$or = [
        { nom: new RegExp(nom, 'i') },
        { prenom: new RegExp(nom, 'i') }
      ];
    }
    if (dateDebut || dateFin) {
      filter.createdAt = {};
      if (dateDebut) filter.createdAt.$gte = new Date(dateDebut);
      if (dateFin) filter.createdAt.$lte = new Date(dateFin + 'T23:59:59');
    }

    const bilans = await BilanVisuel.find(filter).sort({ createdAt: -1 }).lean();
    
    if (bilans.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucun bilan à exporter'
      });
    }

    // 38 colonnes CSV
    const fields = [
      'nom', 'prenom', 'date_naissance', 'sexe', 'telephone', 'email', 'ville',
      'motif_consultation', 'antecedents_oculaires', 'antecedents_generaux', 'port_actuel',
      'av_od_sc', 'av_og_sc', 'av_od_ac', 'av_og_ac', 'av_binoculaire',
      'auto_od_sphere', 'auto_od_cylindre', 'auto_od_axe',
      'auto_og_sphere', 'auto_og_cylindre', 'auto_og_axe',
      'rx_od_sphere', 'rx_od_cylindre', 'rx_od_axe', 'rx_od_addition',
      'rx_og_sphere', 'rx_og_cylindre', 'rx_og_axe', 'rx_og_addition',
      'dp_od', 'dp_og', 'dp_binoculaire',
      'pio_od', 'pio_og',
      'diagnostic', 'observations', 'praticien'
    ];
    
    const flattenedData = bilans.map(b => ({
      nom: v(b.nom),
      prenom: v(b.prenom),
      date_naissance: fmtDate(b.date_naissance),
      sexe: v(b.sexe),
      telephone: v(b.telephone),
      email: v(b.email),
      ville: v(b.ville),
      motif_consultation: v(b.motif_consultation),
      antecedents_oculaires: v(b.antecedents_oculaires),
      antecedents_generaux: v(b.antecedents_generaux),
      port_actuel: v(b.port_actuel),
      av_od_sc: v(b.av_od_sc),
      av_og_sc: v(b.av_og_sc),
      av_od_ac: v(b.av_od_ac),
      av_og_ac: v(b.av_og_ac),
      av_binoculaire: v(b.av_binoculaire),
      auto_od_sphere: vn(b.auto_od_sphere),
      auto_od_cylindre: vn(b.auto_od_cylindre),
      auto_od_axe: vn(b.auto_od_axe),
      auto_og_sphere: vn(b.auto_og_sphere),
      auto_og_cylindre: vn(b.auto_og_cylindre),
      auto_og_axe: vn(b.auto_og_axe),
      rx_od_sphere: vn(b.rx_od_sphere),
      rx_od_cylindre: vn(b.rx_od_cylindre),
      rx_od_axe: vn(b.rx_od_axe),
      rx_od_addition: vn(b.rx_od_addition),
      rx_og_sphere: vn(b.rx_og_sphere),
      rx_og_cylindre: vn(b.rx_og_cylindre),
      rx_og_axe: vn(b.rx_og_axe),
      rx_og_addition: vn(b.rx_og_addition),
      dp_od: vn(b.dp_od),
      dp_og: vn(b.dp_og),
      dp_binoculaire: vn(b.dp_binoculaire),
      pio_od: vn(b.pio_od),
      pio_og: vn(b.pio_og),
      diagnostic: v(b.diagnostic),
      observations: v(b.observations),
      praticien: v(b.praticien)
    }));
    
    const parser = new Parser({ fields, delimiter: ';', withBOM: true });
    const csv = parser.parse(flattenedData);

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
    const { sexe, nom, dateDebut, dateFin } = req.query;
    let filter = {};
    
    if (sexe) filter.sexe = sexe;
    if (nom) {
      filter.$or = [
        { nom: new RegExp(nom, 'i') },
        { prenom: new RegExp(nom, 'i') }
      ];
    }
    
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
