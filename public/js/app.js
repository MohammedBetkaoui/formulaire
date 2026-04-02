// Configuration de l'API
const API_URL = window.location.protocol === 'file:'
    ? 'http://localhost:3000/api/bilans'
    : (window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api/bilans'
        : '/api/bilans');

// Etat de l'application
let bilans = [];
// Variables de pagination
let currentPage = 1;
const ITEMS_PER_PAGE = 10;

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

    const ametropieChecked = f.getAll('ametropie');
    const anomaliesChecked = f.getAll('anomalies');

    const bilan = {
        age: parseInt(f.get('age')) || undefined,
        sexe: f.get('sexe') || undefined,
        ametropie: ametropieChecked.length ? ametropieChecked.join(', ') : undefined,
        anomalies: anomaliesChecked.length ? anomaliesChecked.join(', ') : undefined,
        acuite_visuelle: f.get('acuite_visuelle') || undefined
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

// Fonction pour calculer le nombre total de bilans
function calculerTotalBilans(listeBilans) {
    return listeBilans ? listeBilans.length : 0;
}


// Afficher les bilans
function displayBilans(bilansToDisplay) {
    const listDiv = document.getElementById('bilansList');
    
    // Mettre à jour l'affichage du total
    const totalElement = document.getElementById('totalBilansCount');
    if (totalElement) {
        totalElement.textContent = calculerTotalBilans(bilansToDisplay);
    }

    if (bilansToDisplay.length === 0) {
        listDiv.innerHTML = '<div style="text-align:center; padding: 3rem;"><i data-lucide="inbox" style="width:48px;height:48px;color:#cbd5e1;margin-bottom:1rem;"></i><p class="loading" style="padding:0">Aucun bilan trouve</p></div>';
        lucide.createIcons();
        return;
    }

    // Traitement de la pagination
    const totalPages = Math.ceil(bilansToDisplay.length / ITEMS_PER_PAGE);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentBilans = bilansToDisplay.slice(startIndex, endIndex);

    let html = `
        <div style="overflow-x: auto; margin-top: 1rem; border-radius: var(--radius-lg); border: 1px solid var(--border);">
            <table class="modern-table">
                <thead>
                    <tr>
                        <th><i data-lucide="hash" class="icon-sm"></i> Réf</th>
                        <th><i data-lucide="user" class="icon-sm"></i> Patient</th>
                        <th><i data-lucide="eye" class="icon-sm"></i> Amétropie</th>
                        <th><i data-lucide="activity" class="icon-sm"></i> Anomalies</th>
                        <th><i data-lucide="target" class="icon-sm"></i> Acuité</th>
                        <th><i data-lucide="settings" class="icon-sm"></i> Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;

    html += currentBilans.map(bilan => {
        const shortId = bilan._id ? bilan._id.substring(bilan._id.length - 6).toUpperCase() : 'N/A';
        const anomaliesStr = bilan.anomalies ? (bilan.anomalies.length > 25 ? bilan.anomalies.substring(0, 25) + '...' : bilan.anomalies) : '-';
        
        return `
            <tr>
                <td><span class="badge" style="font-family: monospace;">#${shortId}</span></td>
                <td>
                    <div style="font-weight: 600; color: var(--primary);">Age: ${bilan.age || '?'} ans</div>
                    <div style="font-size: 0.85em; color: var(--text-muted);">${bilan.sexe || 'Non spécifié'}</div>
                </td>
                <td><span style="color:var(--text-main); font-weight:500;">${bilan.ametropie || '-'}</span></td>
                <td title="${bilan.anomalies || ''}">${anomaliesStr}</td>
                <td><span class="badge badge-primary">${bilan.acuite_visuelle || '-'}</span></td>
                <td>
                    <div class="table-actions">
                        <button onclick="viewBilan('${bilan._id}')" class="btn btn-secondary btn-sm" title="Voir les détails">
                            <i data-lucide="eye" class="icon-btn"></i> Voir
                        </button>
                        <button onclick="deleteBilan('${bilan._id}')" class="btn btn-danger btn-sm" title="Supprimer">
                            <i data-lucide="trash-2" class="icon-btn"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    html += `
                </tbody>
            </table>
        </div>
    `;

    // Contrôles de pagination
    if (totalPages > 1) {
        html += `
            <div class="pagination">
                <button class="btn btn-secondary btn-sm" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
                    <i data-lucide="chevron-left" class="icon-btn"></i> Précédent
                </button>
                <div class="page-info">
                    Page <strong>${currentPage}</strong> sur <strong>${totalPages}</strong>
                    <span class="ml-2" style="font-size: 0.85rem; color: var(--text-muted);">
                        · Affichage de ${startIndex + 1} à ${Math.min(endIndex, bilansToDisplay.length)} sur ${bilansToDisplay.length}
                    </span>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
                    Suivant <i data-lucide="chevron-right" class="icon-btn ml-1"></i>
                </button>
            </div>
        `;
    }

    listDiv.innerHTML = html;
    lucide.createIcons();
}

// Fonction pour changer de page
function changePage(newPage) {
    currentPage = newPage;
    filterBilans(); // Re-filtrer et afficher la bonne page
}


// Filtrer les bilans
function filterBilans() {
    const filterSexe = document.getElementById('filterSexe').value;

    let filtered = bilans.filter(bilan => {
        const sexeMatch = !filterSexe || bilan.sexe === filterSexe;
        return sexeMatch;
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
                        <span class="detail-value">${b.age || '�'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Sexe</span>
                        <span class="detail-value">${b.sexe || '�'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Ametropie</span>
                        <span class="detail-value">${b.ametropie || '�'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Anomalies</span>
                        <span class="detail-value">${b.anomalies || '�'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Acuite Visuelle</span>
                        <span class="detail-value">${b.acuite_visuelle || '�'}</span>
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
