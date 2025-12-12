# Script de Backup para Heladería Nevado Premium
# Crea copias de seguridad antes de modificaciones importantes

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = ".\backups\backup_$timestamp"

Write-Host "🔄 Creando backup en: $backupDir" -ForegroundColor Cyan

# Crear directorio de backup
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Lista de archivos críticos a respaldar
$filesToBackup = @(
    "client\src\pages\AdminSettings.tsx",
    "client\src\components\WhatsAppButton.tsx",
    "client\src\components\WhatsAppButton.css",
    "client\src\pages\Contact.tsx",
    "client\src\pages\Profile.tsx",
    "client\src\pages\Products.tsx",
    "client\src\pages\Cart.tsx",
    "client\src\_core\hooks\useAuth.ts",
    "server\routers.ts",
    "server\db.ts",
    "drizzle\schema.ts"
)

$successCount = 0
$failCount = 0

foreach ($file in $filesToBackup) {
    if (Test-Path $file) {
        $destPath = Join-Path $backupDir $file
        $destDir = Split-Path $destPath -Parent
        
        # Crear directorios necesarios
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        
        Copy-Item -Path $file -Destination $destPath -Force
        Write-Host "  ✓ $file" -ForegroundColor Green
        $successCount++
    }
    else {
        Write-Host "  ✗ $file (no encontrado)" -ForegroundColor Yellow
        $failCount++
    }
}

Write-Host ""
Write-Host "📦 Backup completado:" -ForegroundColor Cyan
Write-Host "  - Archivos respaldados: $successCount" -ForegroundColor Green
Write-Host "  - Archivos no encontrados: $failCount" -ForegroundColor Yellow
Write-Host "  - Ubicación: $backupDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Para restaurar: Copy-Item -Path '$backupDir\*' -Destination '.\'  -Recurse -Force" -ForegroundColor Gray
