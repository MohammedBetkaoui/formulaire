@echo off
echo ========================================
echo  Institut BBA - Bilans Visuels
echo  Installation et Demarrage
echo ========================================
echo.

echo [1/3] Verification de Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Node.js n'est pas installe!
    echo Telechargez Node.js depuis: https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js : OK
echo.

echo [2/3] Installation des dependances...
call npm install
if errorlevel 1 (
    echo ERREUR: Echec de l'installation des dependances
    pause
    exit /b 1
)
echo Dependances installees : OK
echo.

echo [3/3] Demarrage du serveur...
echo.
echo ========================================
echo  Serveur demarre !
echo  URL: http://localhost:3000
echo  
echo  Appuyez sur Ctrl+C pour arreter
echo ========================================
echo.

call npm start
