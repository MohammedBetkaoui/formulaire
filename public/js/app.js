// Configuration de l'API
const API_URL = window.location.protocol === 'file:'
    ? 'http://localhost:3000/api/bilans'
    : (window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api/bilans'
        : '/api/bilans');

// Etat de l'application
let bilans = [];

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('bilanForm').addEventListener('submit', saveBilan);
    loadBilans();
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

// Reset form
function resetForm() {
    document.getElementById('bilanForm').reset();
    document.querySelectorAll('.field-error').forEach(f => f.classList.remove('field-error'));
}

// Sauvegarder un bilan
async function saveBilan(e) {
    e.preventDefault();

    const f = new FormData(e.target);

    const bilan = {
        age: parseInt(f.get('age')) || undefined,
        sexe: f.get('sexe') || undefined,
        ametropie: f.get('ametropie') || undefined,
        anomalies: f.get('anomalies') || undefined,
        acuite_visuelle: f.get('acuite_visuelle') || undefined,
        statut_refractif: f.get('statut_refractif') || undefined
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bilan)
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Bilan enregistre avec succes !', 'success');
            e.target.reset();
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

// Afficher les bilans
function displayBilans(bilansToDisplay) {
    const listDiv = document.getElementById('bilansList');

    if (bilansToDisplay.length === 0) {
        listDiv.innerHTML = '<p class="loading">Aucun bilan trouve</p>';
        return;
    }

    listDiv.innerHTML = bilansToDisplay.map(bilan => `
        <div class="bilan-card">
            <div class="bilan-card-header">
                <h4>
                    <i data-lucide="user" class="icon-btn"></i>
                    Age: ${bilan.age || '—'} | ${bilan.sexe || '—'}
                </h4>
                <div class="bilan-card-actions">
                    <button onclick="viewBilan('${bilan._id}')" class="btn btn-secondary"><i data-lucide="eye" class="icon-btn"></i> Voir</button>
                    <button onclick="deleteBilan('${bilan._id}')" class="btn btn-danger"><i data-lucide="trash-2" class="icon-btn"></i></button>
                </div>
            </div>
            <div class="bilan-card-content">
                <div class="bilan-info">
                    <strong>Ametropie</strong>
                    <span>${bilan.ametropie || '—'}</span>
                </div>
                <div class="bilan-info">
                    <strong>Anomalies</strong>
                    <span>${bilan.anomalies || '—'}</span>
                </div>
                <div class="bilan-info">
                    <strong>Acuite Visuelle</strong>
                    <span>${bilan.acuite_visuelle || '—'}</span>
                </div>
                <div class="bilan-info">
                    <strong>Statut</strong>
                    <span>${bilan.statut_refractif || '—'}</span>
                </div>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

// Filtrer les bilans
function filterBilans() {
    const filterSexe = document.getElementById('filterSexe').value;
    const filterStatut = document.getElementById('filterStatut').value;

    let filtered = bilans.filter(bilan => {
        const sexeMatch = !filterSexe || bilan.sexe === filterSexe;
        const statutMatch = !filterStatut || bilan.statut_refractif === filterStatut;
        return sexeMatch && statutMatch;
    });

    displayBilans(filtered);
}

// Voir un bilan en detail (modal)
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
                        <span class="detail-label">Age</span>
                        <span class="detail-value">${b.age || '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Sexe</span>
                        <span class="detail-value">${b.sexe || '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Ametropie</span>
                        <span class="detail-value">${b.ametropie || '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Anomalies</span>
                        <span class="detail-value">${b.anomalies || '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Acuite Visuelle</span>
                        <span class="detail-value">${b.acuite_visuelle || '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Statut Refractif</span>
                        <span class="detail-value">${b.statut_refractif || '—'}</span>
                    </div>
                </div>
            `;
            document.getElementById('bilanModal').classList.add('show');
        }
    } catch (error) {
        showNotification('Erreur lors de la recuperation du bilan', 'error');
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
    if (!confirm('Etes-vous sur de vouloir supprimer ce bilan ?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        const result = await response.json();

        if (result.success) {
            showNotification('Bilan supprime', 'success');
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
        showNotification('Preparation de l\'export...', 'info');

        const params = new URLSearchParams();
        const filterSexe = document.getElementById('filterSexe')?.value;
        const filterDateDebut = document.getElementById('filterDateDebut')?.value;
        const filterDateFin = document.getElementById('filterDateFin')?.value;

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
        showNotification(`Export CSV reussi ! (${count} bilan${count > 1 ? 's' : ''})`, 'success');
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
