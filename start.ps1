# Script de démarrage PowerShell pour l'application BBA

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Institut BBA - Bilans Visuels" -ForegroundColor Cyan
Write-Host " Installation et Demarrage" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier Node.js
Write-Host "[1/3] Verification de Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js $nodeVersion : OK" -ForegroundColor Green
} catch {
    Write-Host "ERREUR: Node.js n'est pas installe!" -ForegroundColor Red
    Write-Host "Telechargez Node.js depuis: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Appuyez sur Entree pour quitter"
    exit 1
}
Write-Host ""

# Vérifier MongoDB
Write-Host "[2/3] Verification de MongoDB..." -ForegroundColor Yellow
try {
    $mongoProcess = Get-Process -Name mongod -ErrorAction SilentlyContinue
    if ($mongoProcess) {
        Write-Host "MongoDB : En cours d'execution" -ForegroundColor Green
    } else {
        Write-Host "AVERTISSEMENT: MongoDB ne semble pas etre en cours d'execution" -ForegroundColor Yellow
        Write-Host "Si vous utilisez MongoDB Atlas (cloud), ignorez ce message" -ForegroundColor Cyan
        Write-Host "Sinon, demarrez MongoDB avant de continuer" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Impossible de verifier MongoDB" -ForegroundColor Yellow
}
Write-Host ""

# Installer les dépendances
Write-Host "[3/3] Installation des dependances..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERREUR: Echec de l'installation des dependances" -ForegroundColor Red
        Read-Host "Appuyez sur Entree pour quitter"
        exit 1
    }
    Write-Host "Dependances installees : OK" -ForegroundColor Green
} else {
    Write-Host "Dependances deja installees : OK" -ForegroundColor Green
}
Write-Host ""

# Démarrer le serveur
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Demarrage du serveur..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URL: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arreter le serveur" -ForegroundColor Gray
Write-Host ""

npm start
