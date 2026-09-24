# Script de Verificación y Compilación de Contenedor Docker Local
Write-Host "🐳 SISBIRCECA: Verificando empaquetado Docker multi-stage..." -ForegroundColor Cyan

# 1. Comprobar Docker daemon
docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Docker Desktop no está en ejecución. Por favor inicie Docker Desktop en Windows." -ForegroundColor Yellow
    exit 0
}

# 2. Compilar imagen
Write-Host "📦 Compilando imagen local: sisbirceca-app:latest" -ForegroundColor Green
docker build -t sisbirceca-app:latest .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Imagen Docker compilada exitosamente." -ForegroundColor Green
} else {
    Write-Host "❌ Error en compilación de imagen Docker." -ForegroundColor Red
}
