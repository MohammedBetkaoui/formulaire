// Configuration de l'API
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api/bilans'
    : '/api/bilans';

// État de l'application
let bilans = [];

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Définir la date par défaut à aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateExamen').value = today;
    
    // Événement de soumission du formulaire
    document.getElementById('bilanForm').addEventListener('submit', saveBilan);
    
    // Charger les bilans au démarrage
    loadBilans();
});

// Gestion des onglets
function showTab(tabName) {
    // Masquer tous les onglets
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Désactiver tous les boutons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Activer l'onglet sélectionné
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    // Recharger les données si nécessaire
    if (tabName === 'liste') {
        loadBilans();
    }
}

// Sauvegarder un bilan
async function saveBilan(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    // Construire l'objet bilan
    const bilan = {
        nom: formData.get('nom'),
        prenom: formData.get('prenom'),
        age: parseInt(formData.get('age')),
        sexe: formData.get('sexe'),
        dateNaissance: formData.get('dateNaissance') || undefined,
        telephone: formData.get('telephone') || undefined,
        motifConsultation: formData.get('motifConsultation'),
        antecedentsMedicaux: formData.get('antecedentsMedicaux') || undefined,
        antecedentsOphtalmologiques: formData.get('antecedentsOphtalmologiques') || undefined,
        
        acuiteVisuelle: {
            oeilDroit: {
                loin: {
                    sansCorrection: formData.get('avOdLoinSc') || undefined,
                    avecCorrection: formData.get('avOdLoinAc') || undefined
                },
                pres: {
                    sansCorrection: formData.get('avOdPresSc') || undefined,
                    avecCorrection: formData.get('avOdPresAc') || undefined
                }
            },
            oeilGauche: {
                loin: {
                    sansCorrection: formData.get('avOgLoinSc') || undefined,
                    avecCorrection: formData.get('avOgLoinAc') || undefined
                },
                pres: {
                    sansCorrection: formData.get('avOgPresSc') || undefined,
                    avecCorrection: formData.get('avOgPresAc') || undefined
                }
            },
            binoculaire: {
                loin: formData.get('avBinoLoin') || undefined,
                pres: formData.get('avBinoPres') || undefined
            }
        },
        
        refraction: {
            oeilDroit: {
                sphere: parseFloat(formData.get('refOdSphere')) || undefined,
                cylindre: parseFloat(formData.get('refOdCylindre')) || undefined,
                axe: parseInt(formData.get('refOdAxe')) || undefined,
                addition: parseFloat(formData.get('refOdAddition')) || undefined
            },
            oeilGauche: {
                sphere: parseFloat(formData.get('refOgSphere')) || undefined,
                cylindre: parseFloat(formData.get('refOgCylindre')) || undefined,
                axe: parseInt(formData.get('refOgAxe')) || undefined,
                addition: parseFloat(formData.get('refOgAddition')) || undefined
            }
        },
        
        motiliteOculaire: formData.get('motiliteOculaire') || 'Non testé',
        visionBinoculaire: formData.get('visionBinoculaire') || 'Non testé',
        champVisuel: formData.get('champVisuel') || 'Non testé',
        testCouleur: formData.get('testCouleur') || 'Non testé',
        
        anomaliesDetectees: Array.from(document.getElementById('anomaliesDetectees').selectedOptions).map(opt => opt.value),
        diagnostic: formData.get('diagnostic') || undefined,
        observations: formData.get('observations') || undefined,
        prescription: formData.get('prescription') || undefined,
        orientation: formData.get('orientation') || undefined,
        
        dateExamen: formData.get('dateExamen') || new Date().toISOString(),
        examinateur: formData.get('examinateur') || undefined
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bilan)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Bilan enregistré avec succès !', 'success');
            e.target.reset();
            document.getElementById('dateExamen').value = new Date().toISOString().split('T')[0];
            loadBilans();
        } else {
            showNotification('Erreur: ' + result.message, 'error');
        }
    } catch (error) {
        showNotification('Erreur de connexion au serveur', 'error');
        console.error('Erreur:', error);
    }
}

// Charger tous les bilans
async function loadBilans(filters = {}) {
    const listDiv = document.getElementById('bilansList');
    listDiv.innerHTML = '<p class="loading">Chargement...</p>';
    
    try {
        let url = API_URL;
        const params = new URLSearchParams(filters);
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            bilans = result.data;
            displayBilans(bilans);
        } else {
            listDiv.innerHTML = '<p class="loading">❌ Erreur de chargement</p>';
        }
    } catch (error) {
        listDiv.innerHTML = '<p class="loading">❌ Erreur de connexion</p>';
        console.error('Erreur:', error);
    }
}

// Afficher les bilans
function displayBilans(bilansToDisplay) {
    const listDiv = document.getElementById('bilansList');
    
    if (bilansToDisplay.length === 0) {
        listDiv.innerHTML = '<p class="loading">Aucun bilan trouvé</p>';
        return;
    }
    
    listDiv.innerHTML = bilansToDisplay.map(bilan => `
        <div class="bilan-card">
            <div class="bilan-card-header">
                <h4><i data-lucide="user" class="icon-btn"></i> ${bilan.nom} ${bilan.prenom}</h4>
                <div class="bilan-card-actions">
                    <button onclick="viewBilan('${bilan._id}')" class="btn btn-secondary"><i data-lucide="eye" class="icon-btn"></i> Voir</button>
                    <button onclick="deleteBilan('${bilan._id}')" class="btn btn-danger"><i data-lucide="trash-2" class="icon-btn"></i></button>
                </div>
            </div>
            <div class="bilan-card-content">
                <div class="bilan-info">
                    <strong>Âge</strong>
                    <span>${bilan.age} ans (${bilan.sexe})</span>
                </div>
                <div class="bilan-info">
                    <strong>Date examen</strong>
                    <span>${new Date(bilan.dateExamen).toLocaleDateString('fr-FR')}</span>
                </div>
                <div class="bilan-info">
                    <strong>Motif</strong>
                    <span>${bilan.motifConsultation}</span>
                </div>
                <div class="bilan-info">
                    <strong>Anomalies</strong>
                    <span>${bilan.anomaliesDetectees && bilan.anomaliesDetectees.length > 0 ? bilan.anomaliesDetectees.join(', ') : 'Aucune'}</span>
                </div>
                ${bilan.diagnostic ? `
                <div class="bilan-info" style="grid-column: 1 / -1;">
                    <strong>Diagnostic</strong>
                    <span>${bilan.diagnostic}</span>
                </div>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    // Re-initialize Lucide icons for dynamically added content
    lucide.createIcons();
}

// Filtrer les bilans
function filterBilans() {
    const searchNom = document.getElementById('searchNom').value.toLowerCase();
    const filterSexe = document.getElementById('filterSexe').value;
    
    let filtered = bilans.filter(bilan => {
        const nomMatch = bilan.nom.toLowerCase().includes(searchNom) || 
                        bilan.prenom.toLowerCase().includes(searchNom);
        const sexeMatch = !filterSexe || bilan.sexe === filterSexe;
        
        return nomMatch && sexeMatch;
    });
    
    displayBilans(filtered);
}

// Voir un bilan en détail (modal)
async function viewBilan(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const result = await response.json();
        
        if (result.success) {
            const b = result.data;
            const modalBody = document.getElementById('modalBody');
            modalBody.innerHTML = `
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Nom</span>
                        <span class="detail-value">${b.nom}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Prénom</span>
                        <span class="detail-value">${b.prenom}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Âge</span>
                        <span class="detail-value">${b.age} ans</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Sexe</span>
                        <span class="detail-value">${b.sexe}</span>
                    </div>
                    <div class="detail-divider"></div>
                    <div class="detail-item">
                        <span class="detail-label">Date d'examen</span>
                        <span class="detail-value">${new Date(b.dateExamen).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Motif</span>
                        <span class="detail-value">${b.motifConsultation}</span>
                    </div>
                    ${b.examinateur ? `<div class="detail-item"><span class="detail-label">Examinateur</span><span class="detail-value">${b.examinateur}</span></div>` : ''}
                    ${b.telephone ? `<div class="detail-item"><span class="detail-label">Téléphone</span><span class="detail-value">${b.telephone}</span></div>` : ''}
                    <div class="detail-divider"></div>
                    <div class="detail-item full-width">
                        <span class="detail-label">Anomalies détectées</span>
                        <span class="detail-value">${b.anomaliesDetectees?.length > 0 ? b.anomaliesDetectees.join(', ') : 'Aucune'}</span>
                    </div>
                    <div class="detail-item full-width">
                        <span class="detail-label">Diagnostic</span>
                        <span class="detail-value">${b.diagnostic || 'Non renseigné'}</span>
                    </div>
                    ${b.prescription ? `<div class="detail-item full-width"><span class="detail-label">Prescription</span><span class="detail-value">${b.prescription}</span></div>` : ''}
                    ${b.observations ? `<div class="detail-item full-width"><span class="detail-label">Observations</span><span class="detail-value">${b.observations}</span></div>` : ''}
                    ${b.orientation ? `<div class="detail-item full-width"><span class="detail-label">Orientation</span><span class="detail-value">${b.orientation}</span></div>` : ''}
                </div>
            `;
            document.getElementById('bilanModal').classList.add('show');
        }
    } catch (error) {
        showNotification('Erreur lors de la récupération du bilan', 'error');
    }
}

// Fermer le modal
function closeModal(event) {
    if (event.target === event.currentTarget) {
        document.getElementById('bilanModal').classList.remove('show');
    }
}

// Supprimer un bilan
async function deleteBilan(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce bilan ?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Bilan supprimé avec succès', 'success');
            loadBilans();
        } else {
            showNotification('Erreur lors de la suppression', 'error');
        }
    } catch (error) {
        showNotification('Erreur de connexion', 'error');
    }
}

// Exporter en CSV
async function exportCSV() {
    try {
        showNotification('Téléchargement en cours...', 'info');
        
        const response = await fetch(`${API_URL}/export/csv`);
        
        if (!response.ok) {
            throw new Error('Erreur lors de l\'export');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bilans_visuels_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showNotification('Export CSV réussi !', 'success');
    } catch (error) {
        showNotification('Erreur lors de l\'export', 'error');
        console.error('Erreur:', error);
    }
}

// Afficher une notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
