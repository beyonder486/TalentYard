# TalentYard — Setup Script
# Run this in PowerShell as Administrator if npm is not yet installed

Write-Host "=== TalentYard Setup ===" -ForegroundColor Cyan

# 1. Try to install Node.js via winget (Windows Package Manager)
$nodeFound = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeFound) {
    Write-Host "Node.js not found. Installing via winget..." -ForegroundColor Yellow
    winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
    # Refresh PATH
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
}

$nodeFound = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeFound) {
    Write-Host "ERROR: Node.js still not found. Please download from https://nodejs.org and re-run." -ForegroundColor Red
    exit 1
}

Write-Host "Node $(node --version) found." -ForegroundColor Green

# 2. Install dependencies
Write-Host "Installing npm packages..." -ForegroundColor Cyan
Set-Location "c:\Users\Acer\OneDrive\Desktop\Isd_project\TalentYard"
npm install

# 3. Start dev server
Write-Host "Starting dev server at http://localhost:3000" -ForegroundColor Green
npm run dev
