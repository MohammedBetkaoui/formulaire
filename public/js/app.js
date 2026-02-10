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

// Toggle correction actuelle fields
function toggleCorrectionFields() {
    const val = document.getElementById('correctionActuelle').value;
    const details = document.getElementById('correctionDetails');
    if (val === 'Oui') {
        details.classList.remove('correction-hidden');
        details.classList.add('correction-visible');
    } else {
        details.classList.add('correction-hidden');
        details.classList.remove('correction-visible');
    }
}

// Reset form
function resetForm() {
    document.getElementById('bilanForm').reset();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateExamen').value = today;
    toggleCorrectionFields();
}

// Helper: get float or undefined
function pf(val) { const v = parseFloat(val); return isNaN(v) ? undefined : v; }
function pi(val) { const v = parseInt(val); return isNaN(v) ? undefined : v; }

// Sauvegarder un bilan
async function saveBilan(e) {
    e.preventDefault();
    
    const f = new FormData(e.target);
    
    // Collect checked anomalies
    const typeAnomalie = [];
    document.querySelectorAll('input[name="typeAnomalie"]:checked').forEach(cb => {
        typeAnomalie.push(cb.value);
    });
    
    const bilan = {
        // Section 1: Identification
        dateExamen: f.get('dateExamen') || new Date().toISOString(),
        sexe: f.get('sexe'),
        age: parseInt(f.get('age')),
        nom: f.get('nom'),
        prenom: f.get('prenom'),
        profession: f.get('profession') || undefined,
        motifConsultation: f.get('motifConsultation'),
        
        // Section 2: Anamnèse
        antecedentsOculaires: f.get('antecedentsOculaires') || undefined,
        antecedentsSystemiques: f.get('antecedentsSystemiques') || undefined,
        correctionActuelle: f.get('correctionActuelle') || 'Non',
        puissanceVerresActuels: {
            od: f.get('puissanceOd') || undefined,
            og: f.get('puissanceOg') || undefined
        },
        
        // Section 3: Pré-tests
        avsc: {
            od: f.get('avscOd') || undefined,
            og: f.get('avscOg') || undefined,
            bin: f.get('avscBin') || undefined
        },
        avcc: {
            od: f.get('avccOd') || undefined,
            og: f.get('avccOg') || undefined,
            bin: f.get('avccBin') || undefined
        },
        pio: {
            od: pf(f.get('pioOd')),
            og: pf(f.get('pioOg'))
        },
        motiliteOculaire: f.get('motiliteOculaire') || undefined,
        testIshihara: f.get('testIshihara') || undefined,
        
        // Section 4: Réfraction
        refractionObjective: {
            od: {
                sphere: pf(f.get('refObjOdSphere')),
                cylindre: pf(f.get('refObjOdCylindre')),
                axe: pi(f.get('refObjOdAxe'))
            },
            og: {
                sphere: pf(f.get('refObjOgSphere')),
                cylindre: pf(f.get('refObjOgCylindre')),
                axe: pi(f.get('refObjOgAxe'))
            }
        },
        refractionSubjective: {
            od: {
                sphere: pf(f.get('refSubOdSphere')),
                cylindre: pf(f.get('refSubOdCylindre')),
                axe: pi(f.get('refSubOdAxe')),
                acuiteFinale: f.get('refSubOdAcuite') || undefined
            },
            og: {
                sphere: pf(f.get('refSubOgSphere')),
                cylindre: pf(f.get('refSubOgCylindre')),
                axe: pi(f.get('refSubOgAxe')),
                acuiteFinale: f.get('refSubOgAcuite') || undefined
            }
        },
        visionDePres: {
            addition: pf(f.get('visionPresAddition')),
            parinaud: f.get('visionPresParinaud') || undefined
        },
        
        // Section 5: Vision binoculaire
        stereopsie: f.get('stereopsie') || undefined,
        ppc: f.get('ppc') || undefined,
        examenLampeAFente: f.get('examenLampeAFente') || undefined,
        
        // Section 6: Diagnostic
        typeAnomalie: typeAnomalie,
        actionEntreprise: f.get('actionEntreprise') || undefined,
        noteLibre: f.get('noteLibre') || undefined
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bilan)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Bilan enregistré avec succès ! — تم حفظ الفحص بنجاح', 'success');
            e.target.reset();
            document.getElementById('dateExamen').value = new Date().toISOString().split('T')[0];
            toggleCorrectionFields();
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
function fmtRef(obj) {
    if (!obj) return '—';
    const s = obj.sphere != null ? (obj.sphere >= 0 ? '+' : '') + obj.sphere.toFixed(2) : '—';
    const c = obj.cylindre != null ? (obj.cylindre >= 0 ? '+' : '') + obj.cylindre.toFixed(2) : '—';
    const a = obj.axe != null ? obj.axe + '°' : '—';
    if (s === '—' && c === '—' && a === '—') return '—';
    return `${s} (${c}) ${a}`;
}

// Afficher les bilans
function displayBilans(bilansToDisplay) {
    const listDiv = document.getElementById('bilansList');
    
    if (bilansToDisplay.length === 0) {
        listDiv.innerHTML = '<p class="loading">Aucun bilan trouvé — لم يتم العثور على فحوصات</p>';
        return;
    }
    
    listDiv.innerHTML = bilansToDisplay.map(bilan => `
        <div class="bilan-card">
            <div class="bilan-card-header">
                <h4>
                    <i data-lucide="user" class="icon-btn"></i> 
                    ${bilan.idPatient || '—'} | ${bilan.nom} ${bilan.prenom}
                </h4>
                <div class="bilan-card-actions">
                    <button onclick="viewBilan('${bilan._id}')" class="btn btn-secondary"><i data-lucide="eye" class="icon-btn"></i> Voir</button>
                    <button onclick="deleteBilan('${bilan._id}')" class="btn btn-danger"><i data-lucide="trash-2" class="icon-btn"></i></button>
                </div>
            </div>
            <div class="bilan-card-content">
                <div class="bilan-info">
                    <strong>Âge / Sexe — العمر / الجنس</strong>
                    <span>${bilan.age} ans — ${bilan.sexe}</span>
                </div>
                <div class="bilan-info">
                    <strong>Date — التاريخ</strong>
                    <span>${new Date(bilan.dateExamen).toLocaleDateString('fr-FR')}</span>
                </div>
                <div class="bilan-info">
                    <strong>Motif — السبب</strong>
                    <span>${bilan.motifConsultation}</span>
                </div>
                <div class="bilan-info">
                    <strong>Anomalie — الخلل</strong>
                    <span>${bilan.typeAnomalie && bilan.typeAnomalie.length > 0 ? bilan.typeAnomalie.join(', ') : 'Aucune'}</span>
                </div>
                ${bilan.actionEntreprise ? `
                <div class="bilan-info" style="grid-column: 1 / -1;">
                    <strong>Action — الإجراء</strong>
                    <span>${bilan.actionEntreprise}</span>
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
                        bilan.prenom.toLowerCase().includes(searchNom) ||
                        (bilan.idPatient && bilan.idPatient.toLowerCase().includes(searchNom));
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
                <!-- Section 1 -->
                <h4 class="modal-section-title">1. Identification — تعريف المريض</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">ID Patient — رقم المريض</span>
                        <span class="detail-value">${b.idPatient || '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Date — التاريخ</span>
                        <span class="detail-value">${new Date(b.dateExamen).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Nom — اللقب</span>
                        <span class="detail-value">${b.nom}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Prénom — الاسم</span>
                        <span class="detail-value">${b.prenom}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Âge — العمر</span>
                        <span class="detail-value">${b.age} ans</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Sexe — الجنس</span>
                        <span class="detail-value">${b.sexe}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Profession — المهنة</span>
                        <span class="detail-value">${b.profession || '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Motif — سبب الاستشارة</span>
                        <span class="detail-value">${b.motifConsultation}</span>
                    </div>
                </div>
                <div class="detail-divider"></div>

                <!-- Section 2 -->
                <h4 class="modal-section-title">2. Anamnèse — السوابق المرضية</h4>
                <div class="detail-grid">
                    <div class="detail-item full-width">
                        <span class="detail-label">Antécédents oculaires — السوابق العينية</span>
                        <span class="detail-value">${b.antecedentsOculaires || '—'}</span>
                    </div>
                    <div class="detail-item full-width">
                        <span class="detail-label">Antécédents systémiques — السوابق العامة</span>
                        <span class="detail-value">${b.antecedentsSystemiques || '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Correction actuelle — تصحيح حالي</span>
                        <span class="detail-value">${b.correctionActuelle || 'Non'}</span>
                    </div>
                    ${b.correctionActuelle === 'Oui' ? `
                    <div class="detail-item">
                        <span class="detail-label">Puissance OD/OG — قوة العدسة</span>
                        <span class="detail-value">OD: ${b.puissanceVerresActuels?.od || '—'} | OG: ${b.puissanceVerresActuels?.og || '—'}</span>
                    </div>` : ''}
                </div>
                <div class="detail-divider"></div>

                <!-- Section 3 -->
                <h4 class="modal-section-title">3. Pré-tests — الفحوصات الأولية</h4>
                <div class="detail-grid">
                    <div class="detail-item full-width">
                        <span class="detail-label">AVSC (Sans Correction) — حدة بصر بدون تصحيح</span>
                        <span class="detail-value">OD: ${b.avsc?.od || '—'} | OG: ${b.avsc?.og || '—'} | BIN: ${b.avsc?.bin || '—'}</span>
                    </div>
                    <div class="detail-item full-width">
                        <span class="detail-label">AVCC (Avec Correction) — حدة بصر مع تصحيح</span>
                        <span class="detail-value">OD: ${b.avcc?.od || '—'} | OG: ${b.avcc?.og || '—'} | BIN: ${b.avcc?.bin || '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">PIO — ضغط العين</span>
                        <span class="detail-value">OD: ${b.pio?.od != null ? b.pio.od + ' mmHg' : '—'} | OG: ${b.pio?.og != null ? b.pio.og + ' mmHg' : '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Motilité — حركة العين</span>
                        <span class="detail-value">${b.motiliteOculaire || '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Ishihara — اختبار الألوان</span>
                        <span class="detail-value">${b.testIshihara || '—'}</span>
                    </div>
                </div>
                <div class="detail-divider"></div>

                <!-- Section 4 -->
                <h4 class="modal-section-title">4. Réfraction — الانكسار</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Objective OD — موضوعي عين يمنى</span>
                        <span class="detail-value">${fmtRef(b.refractionObjective?.od)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Objective OG — موضوعي عين يسرى</span>
                        <span class="detail-value">${fmtRef(b.refractionObjective?.og)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Subjective OD — ذاتي عين يمنى</span>
                        <span class="detail-value">${fmtRef(b.refractionSubjective?.od)} → ${b.refractionSubjective?.od?.acuiteFinale || '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Subjective OG — ذاتي عين يسرى</span>
                        <span class="detail-value">${fmtRef(b.refractionSubjective?.og)} → ${b.refractionSubjective?.og?.acuiteFinale || '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Addition — إضافة</span>
                        <span class="detail-value">${b.visionDePres?.addition != null ? '+' + b.visionDePres.addition.toFixed(2) : '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Parinaud — بارينو</span>
                        <span class="detail-value">${b.visionDePres?.parinaud || '—'}</span>
                    </div>
                </div>
                <div class="detail-divider"></div>

                <!-- Section 5 -->
                <h4 class="modal-section-title">5. Vision Binoculaire — الرؤية المزدوجة</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Stéréopsie — رؤية مجسمة</span>
                        <span class="detail-value">${b.stereopsie || '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">PPC — نقطة التقارب</span>
                        <span class="detail-value">${b.ppc || '—'}</span>
                    </div>
                    <div class="detail-item full-width">
                        <span class="detail-label">Lampe à fente — المصباح الشقي</span>
                        <span class="detail-value">${b.examenLampeAFente || '—'}</span>
                    </div>
                </div>
                <div class="detail-divider"></div>

                <!-- Section 6 -->
                <h4 class="modal-section-title">6. Diagnostic & Décision — التشخيص والقرار</h4>
                <div class="detail-grid">
                    <div class="detail-item full-width">
                        <span class="detail-label">Type d'anomalie — نوع الخلل</span>
                        <span class="detail-value">${b.typeAnomalie?.length > 0 ? b.typeAnomalie.join(', ') : 'Aucune — لا يوجد'}</span>
                    </div>
                    <div class="detail-item full-width">
                        <span class="detail-label">Action entreprise — الإجراء المتخذ</span>
                        <span class="detail-value">${b.actionEntreprise || '—'}</span>
                    </div>
                    ${b.noteLibre ? `
                    <div class="detail-item full-width">
                        <span class="detail-label">Notes — ملاحظات</span>
                        <span class="detail-value">${b.noteLibre}</span>
                    </div>` : ''}
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce bilan ?\nهل أنت متأكد من حذف هذا الفحص؟')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        const result = await response.json();
        
        if (result.success) {
            showNotification('Bilan supprimé — تم الحذف', 'success');
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
