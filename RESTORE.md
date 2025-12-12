# Guía de Restauración de Backups

Este documento explica cómo restaurar los archivos desde las copias de seguridad creadas por el script `backup.ps1`.

## Ubicación de los Backups

Los backups se crean en el directorio:
```
.\backups\backup_YYYYMMDD_HHmmss\
```

Donde `YYYYMMDD_HHmmss` es la fecha y hora de creación del backup.

## Cómo Restaurar

### Opción 1: Restauración Completa (PowerShell)

Para restaurar todos los archivos desde un backup específico:

```powershell
# Reemplaza la fecha/hora con tu backup deseado
$backupDir = ".\backups\backup_20251204_184700"

# Restaurar todos los archivos
Copy-Item -Path "$backupDir\*" -Destination ".\" -Recurse -Force
```

### Opción 2: Restauración Selectiva

Para restaurar archivos específicos:

```powershell
# Ejemplo: Restaurar solo AdminSettings.tsx
$backupDir = ".\backups\backup_20251204_184700"
Copy-Item -Path "$backupDir\client\src\pages\AdminSettings.tsx" -Destination ".\client\src\pages\AdminSettings.tsx" -Force

# Ejemplo: Restaurar solo routers.ts
Copy-Item -Path "$backupDir\server\routers.ts" -Destination ".\server\routers.ts" -Force
```

### Opción 3: Restauración con Confirmación

Si quieres ver qué archivos se van a sobrescribir antes de confirmar:

```powershell
$backupDir = ".\backups\backup_20251204_184700"

# Listar archivos que existen tanto en backup como en destino
Get-ChildItem -Path $backupDir -Recurse -File | ForEach-Object {
    $destPath = $_.FullName.Replace($backupDir, ".")
    if (Test-Path $destPath) {
        Write-Host "Existe: $destPath"
    }
}

# Si todo se ve bien, proceder con la restauración
Copy-Item -Path "$backupDir\*" -Destination ".\" -Recurse -Force
```

## Archivos Incluidos en el Backup

El script `backup.ps1` respalda los siguientes archivos:

- `client\src\pages\AdminSettings.tsx`
- `client\src\components\WhatsAppButton.tsx`
- `client\src\components\WhatsAppButton.css`
- `client\src\pages\Contact.tsx`
- `client\src\pages\Profile.tsx`
- `client\src\pages\Products.tsx`
- `client\src\pages\Cart.tsx`
- `client\src\_core\hooks\useAuth.ts`
- `server\routers.ts`
- `server\db.ts`
- `drizzle\schema.ts`

## Verificación Post-Restauración

Después de restaurar, verifica que los archivos se restauraron correctamente:

```powershell
# Ver archivos restaurados recientemente
Get-ChildItem -Recurse -File | Where-Object {
    $_.LastWriteTime -gt (Get-Date).AddMinutes(-5)
} | Select-Object FullName, LastWriteTime
```

## Precauciones Importantes

> ⚠️ **ADVERTENCIA**: La restauración sobrescribirá los archivos actuales sin confirmación cuando uses `-Force`.

### Antes de Restaurar:

1. **Crea un nuevo backup** de los archivos actuales si quieres preservar el estado actual:
   ```powershell
   .\backup.ps1
   ```

2. **Verifica que estás restaurando el backup correcto** revisando la fecha y hora.

3. **Asegúrate de que no hay cambios sin guardar** en tu editor de código.

4. **Si tienes el servidor corriendo**, detén el servidor antes de restaurar:
   ```powershell
   # Presiona Ctrl+C en la terminal del servidor
   ```

5. **Después de restaurar**, reinicia el servidor:
   ```powershell
   npm run dev
   ```

## Comparar Archivos Antes de Restaurar

Para comparar un archivo del backup con la versión actual:

```powershell
# Usando notepad++ o tu editor preferido
$backupDir = ".\backups\backup_20251204_184700"
code --diff ".\server\routers.ts" "$backupDir\server\routers.ts"
```

O para ver diferencias en la terminal:

```powershell
# Instalar diff si no lo tienes
# choco install diffutils

diff ".\server\routers.ts" "$backupDir\server\routers.ts"
```

## Listar Todos los Backups Disponibles

```powershell
Get-ChildItem -Path ".\backups" -Directory | Sort-Object Name -Descending
```

## Eliminar Backups Antiguos

Para liberar espacio, puedes eliminar backups antiguos:

```powershell
# Eliminar backups más antiguos de 30 días
$cutoffDate = (Get-Date).AddDays(-30)
Get-ChildItem -Path ".\backups" -Directory | Where-Object {
    $_.CreationTime -lt $cutoffDate
} | Remove-Item -Recurse -Force

# O eliminar todo excepto los últimos 5 backups
Get-ChildItem -Path ".\backups" -Directory | 
    Sort-Object CreationTime -Descending | 
    Select-Object -Skip 5 | 
    Remove-Item -Recurse -Force
```

## Solución de Problemas

### Error: "No se puede acceder al archivo porque está siendo utilizado"

**Solución**: Cierra tu editor de código y el servidor de desarrollo, luego intenta nuevamente.

### Error: "No se encuentra la ruta"

**Solución**: Asegúrate de ejecutar los comandos desde la raíz del proyecto (`heladeria-nevado-premium`).

### Los cambios no se reflejan después de restaurar

**Solución**: 
1. Reinicia el servidor de desarrollo
2. Limpia la caché del navegador (Ctrl + Shift + R)
3. Si usas VS Code, recarga la ventana (Ctrl + Shift + P > "Reload Window")

## Contacto y Soporte

Si tienes problemas con la restauración:
1. Verifica que el backup existe en `.\backups\`
2. Asegúrate de tener permisos de escritura en los directorios
3. Revisa los logs de PowerShell para mensajes de error específicos
