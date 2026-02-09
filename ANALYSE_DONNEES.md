# 📊 Analyse des Données pour le Mémoire

## Guide d'Analyse Statistique

Ce document vous guide dans l'utilisation des données collectées pour votre mémoire sur le dépistage visuel à l'Institut BBA.

---

## 📁 Étape 1 : Collecter les Données

### A. Créer des bilans de test
```bash
npm run seed
```
Cette commande insère 8 bilans de test dans votre base de données.

### B. Créer vos propres bilans
Utilisez l'interface web pour saisir les bilans réels collectés à l'institut BBA.

### C. Exporter les données
1. Allez dans l'onglet "Liste des Bilans"
2. Cliquez sur "Exporter CSV"
3. Ouvrez le fichier CSV dans Excel ou LibreOffice Calc

---

## 📊 Étape 2 : Analyses Statistiques dans Excel

### Classification par Âge

**Tranches d'âge recommandées:**
- 0-17 ans : Enfants/Adolescents
- 18-29 ans : Jeunes adultes
- 30-44 ans : Adultes
- 45-59 ans : Adultes matures
- 60+ ans : Seniors

**Dans Excel:**
1. Créez une colonne "Tranche d'âge"
2. Utilisez la formule :
```excel
=SI(C2<18;"0-17 ans";SI(C2<30;"18-29 ans";SI(C2<45;"30-44 ans";SI(C2<60;"45-59 ans";"60+ ans"))))
```
3. Créez un tableau croisé dynamique
4. Générez un graphique en secteurs ou histogramme

### Classification par Sexe

**Dans Excel:**
1. Insérez un tableau croisé dynamique
2. Lignes : Sexe
3. Valeurs : Nombre de bilans
4. Créez un graphique en barres

### Classification par Motif de Consultation

**Motifs fréquents:**
- Contrôle de routine
- Baisse d'acuité visuelle
- Fatigue visuelle
- Céphalées
- Renouvellement de lunettes
- Douleur oculaire
- Dépistage scolaire

**Dans Excel:**
1. Tableau croisé dynamique sur la colonne "Motif consultation"
2. Triez par fréquence décroissante
3. Créez un graphique en barres horizontales

### Fréquence des Anomalies

**Anomalies à analyser:**
- Myopie
- Hypermétropie
- Astigmatisme
- Presbytie
- Strabisme
- Amblyopie
- Daltonisme

**Dans Excel:**
1. La colonne "Anomalies détectées" contient plusieurs valeurs séparées par ";"
2. Utilisez la fonction "Données > Convertir" pour séparer les valeurs
3. Comptez chaque anomalie
4. Créez un graphique en barres

---

## 📈 Étape 3 : Créer des Graphiques pour le Mémoire

### Graphique 1 : Pyramide des âges
```
Titre : Répartition de la population par tranche d'âge
Type : Histogramme
Axes :
  - X : Tranches d'âge
  - Y : Nombre de patients
```

### Graphique 2 : Répartition par sexe
```
Titre : Distribution hommes/femmes
Type : Graphique circulaire (camembert)
Afficher : Pourcentages
```

### Graphique 3 : Motifs de consultation
```
Titre : Principaux motifs de consultation
Type : Graphique en barres horizontales
Trier : Par fréquence décroissante
```

### Graphique 4 : Anomalies détectées
```
Titre : Prévalence des anomalies visuelles
Type : Graphique en barres
Axes :
  - X : Type d'anomalie
  - Y : Nombre de cas
Afficher : Pourcentages en complément
```

### Graphique 5 : Évolution dans le temps
```
Titre : Nombre de consultations par mois
Type : Courbe
Axes :
  - X : Mois
  - Y : Nombre de bilans
```

---

## 📋 Étape 4 : Tableaux Récapitulatifs

### Tableau 1 : Caractéristiques de la population

| Caractéristique | Nombre | Pourcentage |
|----------------|--------|-------------|
| **Total** | N | 100% |
| **Sexe** | | |
| - Masculin | n | x% |
| - Féminin | n | y% |
| **Âge** | | |
| - 0-17 ans | n | x% |
| - 18-29 ans | n | y% |
| - 30-44 ans | n | z% |
| - 45-59 ans | n | w% |
| - 60+ ans | n | v% |

### Tableau 2 : Prévalence des anomalies

| Anomalie | Nombre de cas | Pourcentage | IC 95% |
|----------|---------------|-------------|---------|
| Myopie | n | x% | [a-b]% |
| Hypermétropie | n | y% | [c-d]% |
| Astigmatisme | n | z% | [e-f]% |
| Presbytie | n | w% | [g-h]% |
| Autres | n | v% | [i-j]% |

### Formule pour l'Intervalle de Confiance (95%)
```
IC 95% = p ± 1.96 × √(p(1-p)/n)

où :
- p = proportion (pourcentage/100)
- n = taille de l'échantillon
```

---

## 📊 Étape 5 : Calculs Statistiques

### Tests statistiques recommandés

**1. Test du Chi² (χ²)**
Pour comparer les fréquences d'anomalies entre hommes et femmes :
```
Dans Excel :
=CHISQ.TEST(plage_observée; plage_attendue)
```

**2. Test t de Student**
Pour comparer l'âge moyen entre deux groupes :
```
Dans Excel :
=TEST.STUDENT(plage1; plage2; 2; 2)
```

**3. Corrélation**
Pour analyser la relation entre âge et type d'anomalie :
```
Dans Excel :
=COEFFICIENT.CORRELATION(plage_x; plage_y)
```

---

## 📝 Étape 6 : Rédaction des Résultats

### Structure recommandée

**3.1. Caractéristiques de la population étudiée**
> "Notre étude a porté sur N patients examinés à l'Institut BBA entre [date] et [date]. 
> L'âge moyen était de X ans (écart-type : Y ans). 
> La population comprenait n1 hommes (x%) et n2 femmes (y%)."

**3.2. Répartition par âge**
> "La tranche d'âge la plus représentée était [X-Y ans] avec n patients (z%), 
> suivie de [A-B ans] avec m patients (w%)." [Référence au Graphique 1]

**3.3. Motifs de consultation**
> "Le principal motif de consultation était [motif] (n cas, x%), 
> suivi de [motif 2] (m cas, y%)." [Référence au Tableau et Graphique 3]

**3.4. Anomalies détectées**
> "Sur N bilans effectués, k présentaient au moins une anomalie (p%). 
> Les anomalies les plus fréquentes étaient : 
> - La myopie : n1 cas (x%) [IC 95% : a-b%]
> - L'astigmatisme : n2 cas (y%) [IC 95% : c-d%]
> - La presbytie : n3 cas (z%) [IC 95% : e-f%]"
> [Référence au Tableau 2 et Graphique 4]

**3.5. Analyses croisées**
> "L'analyse par sexe montre que [anomalie] est plus fréquente chez [sexe] 
> (p < 0.05, test du Chi²)."

---

## 🎯 Étape 7 : Discussion

### Points à discuter

**Points forts de l'étude**
- Données prospectives collectées systématiquement
- Utilisation de protocoles standardisés
- Matériel de qualité disponible à l'Institut BBA
- Formation du personnel

**Limites de l'étude**
- Taille de l'échantillon
- Période de collecte
- Biais de recrutement (patients consultants vs population générale)
- Absence de groupe contrôle

**Comparaison avec la littérature**
> "Nos résultats montrent une prévalence de X% pour la myopie, 
> ce qui est comparable/supérieur/inférieur aux données de [Auteur, Année] 
> qui rapportait Y% dans une population similaire."

**Implications pratiques**
- Importance du dépistage précoce
- Besoins en équipement
- Formation continue
- Campagnes de sensibilisation

---

## 📚 Ressources Complémentaires

### Logiciels d'analyse statistique
- **Excel** : Gratuit avec Office, suffisant pour analyses de base
- **SPSS** : Logiciel professionnel (payant)
- **R** : Gratuit et puissant (courbe d'apprentissage)
- **jamovi** : Gratuit, interface graphique, recommandé

### Sites de référence
- OMS - Santé oculaire : https://www.who.int/fr/health-topics/eye-health
- Société Française d'Ophtalmologie : https://www.sfo.asso.fr/
- IRHO (Institut de Recherche en Hygiène et Ophtalmologie)

---

## ✅ Checklist Finale

Avant de finaliser votre mémoire, vérifiez que vous avez :

- [ ] Exporté toutes les données en CSV
- [ ] Créé tous les tableaux récapitulatifs
- [ ] Généré tous les graphiques nécessaires
- [ ] Calculé les statistiques descriptives (moyennes, écarts-types)
- [ ] Calculé les intervalles de confiance
- [ ] Effectué les tests statistiques appropriés
- [ ] Numéroté tous les tableaux et figures
- [ ] Légendé tous les graphiques
- [ ] Cité les sources dans la discussion
- [ ] Vérifié la cohérence des chiffres
- [ ] Relu l'ensemble

---

**Bon courage pour votre mémoire ! 🎓**
