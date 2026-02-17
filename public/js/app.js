// Configuration de l'API
const API_URL = window.location.protocol === 'file:'
    ? 'http://localhost:3000/api/bilans'
    : (window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api/bilans'
        : '/api/bilans');

// État de l'application
let bilans = [];
let currentStep = 1;
const totalSteps = 6;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Événement de soumission du formulaire
    document.getElementById('bilanForm').addEventListener('submit', saveBilan);
    
    // Charger les bilans au démarrage
    loadBilans();
    
    // Initialiser le wizard
    goToStep(1);
});

// Gestion des onglets
function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.closest('.tab-btn').classList.add('active');
    
    if (tabName === 'liste') {
        loadBilans();
    }
}

// ===== STEP WIZARD NAVIGATION =====
function goToStep(step) {
    if (step < 1 || step > totalSteps) return;
    currentStep = step;

    document.querySelectorAll('.step-section').forEach(sec => sec.classList.remove('active'));
    const target = document.querySelector(`.step-section[data-step="${step}"]`);
    if (target) target.classList.add('active');

    document.querySelectorAll('.stepper-step').forEach(s => {
        const t = parseInt(s.getAttribute('data-target'));
        s.classList.remove('active', 'completed');
        if (t === step) s.classList.add('active');
        else if (t < step) s.classList.add('completed');
    });

    document.querySelectorAll('.stepper-line').forEach((line, idx) => {
        if (idx < step - 1) line.classList.add('completed');
        else line.classList.remove('completed');
    });

    const form = document.getElementById('bilanForm');
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });

    lucide.createIcons();
}

function nextStep() {
    const currentSection = document.querySelector(`.step-section[data-step="${currentStep}"]`);
    if (currentSection) {
        const requiredFields = currentSection.querySelectorAll('[required]');
        let valid = true;
        requiredFields.forEach(field => {
            if (!field.value || field.value.trim() === '') {
                field.classList.add('field-error');
                valid = false;
            } else {
                field.classList.remove('field-error');
            }
        });
        if (!valid) {
            showNotification('Veuillez remplir les champs obligatoires (*)', 'error');
            return;
        }
    }
    if (currentStep < totalSteps) goToStep(currentStep + 1);
}

function prevStep() {
    if (currentStep > 1) goToStep(currentStep - 1);
}

// Reset form
function resetForm() {
    document.getElementById('bilanForm').reset();
    document.querySelectorAll('.field-error').forEach(f => f.classList.remove('field-error'));
    goToStep(1);
}

// Helper: get float or undefined
function pf(val) { const v = parseFloat(val); return isNaN(v) ? undefined : v; }
function pi(val) { const v = parseInt(val); return isNaN(v) ? undefined : v; }

// Sauvegarder un bilan
async function saveBilan(e) {
    e.preventDefault();
    
    const f = new FormData(e.target);
    
    const bilan = {
        // Identification Patient
        nom: f.get('nom'),
        prenom: f.get('prenom'),
        date_naissance: f.get('date_naissance') || undefined,
        sexe: f.get('sexe') || undefined,
        telephone: f.get('telephone') || undefined,
        email: f.get('email') || undefined,
        ville: f.get('ville') || undefined,
        
        // Anamnèse & Contexte
        motif_consultation: f.get('motif_consultation') || undefined,
        antecedents_oculaires: f.get('antecedents_oculaires') || undefined,
        antecedents_generaux: f.get('antecedents_generaux') || undefined,
        port_actuel: f.get('port_actuel') || undefined,
        
        // Acuité Visuelle
        av_od_sc: f.get('av_od_sc') || undefined,
        av_og_sc: f.get('av_og_sc') || undefined,
        av_od_ac: f.get('av_od_ac') || undefined,
        av_og_ac: f.get('av_og_ac') || undefined,
        av_binoculaire: f.get('av_binoculaire') || undefined,
        
        // Autoréfractomètre OD
        auto_od_sphere: pf(f.get('auto_od_sphere')),
        auto_od_cylindre: pf(f.get('auto_od_cylindre')),
        auto_od_axe: pi(f.get('auto_od_axe')),
        
        // Autoréfractomètre OG
        auto_og_sphere: pf(f.get('auto_og_sphere')),
        auto_og_cylindre: pf(f.get('auto_og_cylindre')),
        auto_og_axe: pi(f.get('auto_og_axe')),
        
        // Réfraction subjective OD
        rx_od_sphere: pf(f.get('rx_od_sphere')),
        rx_od_cylindre: pf(f.get('rx_od_cylindre')),
        rx_od_axe: pi(f.get('rx_od_axe')),
        rx_od_addition: pf(f.get('rx_od_addition')),
        
        // Réfraction subjective OG
        rx_og_sphere: pf(f.get('rx_og_sphere')),
        rx_og_cylindre: pf(f.get('rx_og_cylindre')),
        rx_og_axe: pi(f.get('rx_og_axe')),
        rx_og_addition: pf(f.get('rx_og_addition')),
        
        // Diamètre pupillaire
        dp_od: pf(f.get('dp_od')),
        dp_og: pf(f.get('dp_og')),
        dp_binoculaire: pf(f.get('dp_binoculaire')),
        
        // PIO
        pio_od: pf(f.get('pio_od')),
        pio_og: pf(f.get('pio_og')),
        
        // Diagnostic & Suivi
        diagnostic: f.get('diagnostic') || undefined,
        observations: f.get('observations') || undefined,
        praticien: f.get('praticien') || undefined
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bilan)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Bilan enregistré avec succès !', 'success');
            e.target.reset();
            document.querySelectorAll('.field-error').forEach(f => f.classList.remove('field-error'));
            goToStep(1);
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
            listDiv.innerHTML = '<p class="loading">Erreur de chargement</p>';
        }
    } catch (error) {
        listDiv.innerHTML = '<p class="loading">Erreur de connexion</p>';
        console.error('Erreur:', error);
    }
}

// Format réfraction display
function fmtRef(sphere, cylindre, axe) {
    const s = sphere != null ? (sphere >= 0 ? '+' : '') + sphere.toFixed(2) : '—';
    const c = cylindre != null ? (cylindre >= 0 ? '+' : '') + cylindre.toFixed(2) : '—';
    const a = axe != null ? axe + '°' : '—';
    if (s === '—' && c === '—' && a === '—') return '—';
    return `${s} (${c}) ${a}`;
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
                <h4>
                    <i data-lucide="user" class="icon-btn"></i> 
                    ${bilan.nom} ${bilan.prenom}
                </h4>
                <div class="bilan-card-actions">
                    <button onclick="viewBilan('${bilan._id}')" class="btn btn-secondary"><i data-lucide="eye" class="icon-btn"></i> Voir</button>
                    <button onclick="deleteBilan('${bilan._id}')" class="btn btn-danger"><i data-lucide="trash-2" class="icon-btn"></i></button>
                </div>
            </div>
            <div class="bilan-card-content">
                <div class="bilan-info">
                    <strong>Sexe</strong>
                    <span>${bilan.sexe || '—'}</span>
                </div>
                <div class="bilan-info">
                    <strong>Ville</strong>
                    <span>${bilan.ville || '—'}</span>
                </div>
                <div class="bilan-info">
                    <strong>Motif</strong>
                    <span>${bilan.motif_consultation || '—'}</span>
                </div>
                <div class="bilan-info">
                    <strong>Diagnostic</strong>
                    <span>${bilan.diagnostic || '—'}</span>
                </div>
                ${bilan.praticien ? `
                <div class="bilan-info">
                    <strong>Praticien</strong>
                    <span>${bilan.praticien}</span>
                </div>
                ` : ''}
            </div>
        </div>
    `).join('');
    
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
                <!-- Section 1: Identification -->
                <h4 class="modal-section-title">1. Identification Patient</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Nom</span>
                        <span class="detail-value">${b.nom || '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Prénom</span>
                        <span class="detail-value">${b.prenom || '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Date de naissance</span>
                        <span class="detail-value">${b.date_naissance ? new Date(b.date_naissance).toLocaleDateString('fr-FR') : '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Sexe</span>
                        <span class="detail-value">${b.sexe || '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Téléphone</span>
                        <span class="detail-value">${b.telephone || '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Email</span>
                        <span class="detail-value">${b.email || '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Ville</span>
                        <span class="detail-value">${b.ville || '—'}</span>
                    </div>
                </div>
                <div class="detail-divider"></div>

                <!-- Section 2: Anamnèse -->
                <h4 class="modal-section-title">2. Anamnèse & Contexte</h4>
                <div class="detail-grid">
                    <div class="detail-item full-width">
                        <span class="detail-label">Motif de consultation</span>
                        <span class="detail-value">${b.motif_consultation || '—'}</span>
                    </div>
                    <div class="detail-item full-width">
                        <span class="detail-label">Antécédents oculaires</span>
                        <span class="detail-value">${b.antecedents_oculaires || '—'}</span>
                    </div>
                    <div class="detail-item full-width">
                        <span class="detail-label">Antécédents généraux</span>
                        <span class="detail-value">${b.antecedents_generaux || '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Port actuel</span>
                        <span class="detail-value">${b.port_actuel || '—'}</span>
                    </div>
                </div>
                <div class="detail-divider"></div>

                <!-- Section 3: Acuité Visuelle -->
                <h4 class="modal-section-title">3. Acuité Visuelle</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">AV OD SC</span>
                        <span class="detail-value">${b.av_od_sc || '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">AV OG SC</span>
                        <span class="detail-value">${b.av_og_sc || '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">AV OD AC</span>
                        <span class="detail-value">${b.av_od_ac || '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">AV OG AC</span>
                        <span class="detail-value">${b.av_og_ac || '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">AV Binoculaire</span>
                        <span class="detail-value">${b.av_binoculaire || '—'}</span>
                    </div>
                </div>
                <div class="detail-divider"></div>

                <!-- Section 4: Réfraction -->
                <h4 class="modal-section-title">4. Réfraction</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Auto OD</span>
                        <span class="detail-value">${fmtRef(b.auto_od_sphere, b.auto_od_cylindre, b.auto_od_axe)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Auto OG</span>
                        <span class="detail-value">${fmtRef(b.auto_og_sphere, b.auto_og_cylindre, b.auto_og_axe)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Rx Sub. OD</span>
                        <span class="detail-value">${fmtRef(b.rx_od_sphere, b.rx_od_cylindre, b.rx_od_axe)}${b.rx_od_addition != null ? ' Add +' + b.rx_od_addition.toFixed(2) : ''}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Rx Sub. OG</span>
                        <span class="detail-value">${fmtRef(b.rx_og_sphere, b.rx_og_cylindre, b.rx_og_axe)}${b.rx_og_addition != null ? ' Add +' + b.rx_og_addition.toFixed(2) : ''}</span>
                    </div>
                </div>
                <div class="detail-divider"></div>

                <!-- Section 5: DP & PIO -->
                <h4 class="modal-section-title">5. Diamètre Pupillaire & PIO</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">DP OD</span>
                        <span class="detail-value">${b.dp_od != null ? b.dp_od + ' mm' : '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">DP OG</span>
                        <span class="detail-value">${b.dp_og != null ? b.dp_og + ' mm' : '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">DP Binoculaire</span>
                        <span class="detail-value">${b.dp_binoculaire != null ? b.dp_binoculaire + ' mm' : '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">PIO OD</span>
                        <span class="detail-value">${b.pio_od != null ? b.pio_od + ' mmHg' : '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">PIO OG</span>
                        <span class="detail-value">${b.pio_og != null ? b.pio_og + ' mmHg' : '—'}</span>
                    </div>
                </div>
                <div class="detail-divider"></div>

                <!-- Section 6: Diagnostic -->
                <h4 class="modal-section-title">6. Diagnostic & Suivi</h4>
                <div class="detail-grid">
                    <div class="detail-item full-width">
                        <span class="detail-label">Diagnostic</span>
                        <span class="detail-value">${b.diagnostic || '—'}</span>
                    </div>
                    ${b.observations ? `
                    <div class="detail-item full-width">
                        <span class="detail-label">Observations</span>
                        <span class="detail-value">${b.observations}</span>
                    </div>` : ''}
                    <div class="detail-item">
                        <span class="detail-label">Praticien</span>
                        <span class="detail-value">${b.praticien || '—'}</span>
                    </div>
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
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        const result = await response.json();
        
        if (result.success) {
            showNotification('Bilan supprimé', 'success');
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
        showNotification('Préparation de l\'export...', 'info');

        const params = new URLSearchParams();
        const searchNom = document.getElementById('searchNom')?.value?.trim();
        const filterSexe = document.getElementById('filterSexe')?.value;
        const filterDateDebut = document.getElementById('filterDateDebut')?.value;
        const filterDateFin = document.getElementById('filterDateFin')?.value;

        if (searchNom) params.set('nom', searchNom);
        if (filterSexe) params.set('sexe', filterSexe);
        if (filterDateDebut) params.set('dateDebut', filterDateDebut);
        if (filterDateFin) params.set('dateFin', filterDateFin);

        const queryStr = params.toString();
        const url = `${API_URL}/export/csv${queryStr ? '?' + queryStr : ''}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.message || 'Erreur lors de l\'export');
        }
        
        const disposition = response.headers.get('Content-Disposition');
        let filename = 'bilans_BBA.csv';
        if (disposition) {
            const match = disposition.match(/filename="?([^"]+)"?/);
            if (match) filename = match[1];
        }

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
        
        const count = bilans.length;
        showNotification(`Export CSV réussi ! (${count} bilan${count > 1 ? 's' : ''})`, 'success');
    } catch (error) {
        showNotification(error.message || 'Erreur lors de l\'export', 'error');
        console.error('Erreur export:', error);
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
