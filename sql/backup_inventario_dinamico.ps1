# Configuración
$database = "inventario_dinamico"
$backupRoot = "D:\local programas\BACKUP"
$user = "root"
$password = "1234"

# Rutas a mysql y mysqldump
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$mysqldumpPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe"

# Verificar que mysqldump existe
if (!(Test-Path $mysqldumpPath)) {
    Write-Error "No se encuentra mysqldump en la ruta: $mysqldumpPath"
    exit 1
}

# Obtener la fecha actual
$currentYear = (Get-Date -Format "yyyy")
$currentMonth = (Get-Date -Format "MMM").ToLower()
$currentDay = (Get-Date -Format "dd-MM-yyyy")

# Crear la estructura de carpetas
$yearFolder = Join-Path -Path $backupRoot -ChildPath "backup$currentYear"
$monthFolder = Join-Path -Path $yearFolder -ChildPath $currentMonth
$dayFolder = Join-Path -Path $monthFolder -ChildPath $currentDay

# Crear las carpetas si no existen
@($yearFolder, $monthFolder, $dayFolder) | ForEach-Object {
    if (!(Test-Path -Path $_)) {
        New-Item -ItemType Directory -Path $_ | Out-Null
    }
}

# Nombre del archivo de backup
$tempBackupFile = Join-Path -Path $env:TEMP -ChildPath "$($database)_backup_temp.sql"
$backupFile = Join-Path -Path $dayFolder -ChildPath "$($database)_backup_$(Get-Date -Format 'yyyy-MM-dd').sql"

# Realizar el backup
Write-Output "Realizando backup completo de la base de datos: $database"

# Ejecutar mysqldump con parámetros directos
try {
    $mysqldumpArgs = @(
        "--user=`"$user`""
        "--password=`"$password`""
        "--default-character-set=utf8mb4"
        "--set-charset"
        "--databases"
        $database
        "--result-file=`"$tempBackupFile`""
    )
    
    $process = Start-Process -FilePath $mysqldumpPath -ArgumentList $mysqldumpArgs -NoNewWindow -Wait -PassThru
    
    if ($process.ExitCode -ne 0) {
        Write-Error "Error al ejecutar mysqldump. Código de salida: $($process.ExitCode)"
        exit 1
    }
} catch {
    Write-Error "Error al ejecutar mysqldump: $_"
    exit 1
}

# Verificar que el archivo temporal existe y tiene contenido
if (!(Test-Path $tempBackupFile) -or (Get-Item $tempBackupFile).Length -eq 0) {
    Write-Error "El archivo de backup temporal no se creó correctamente o está vacío"
    exit 1
}

# Crear el archivo final con codificación UTF8
Set-Content -Path $backupFile -Value "USE $database;" -Encoding UTF8
Add-Content -Path $backupFile -Value (Get-Content $tempBackupFile -Encoding UTF8) -Encoding UTF8

# Verificar que el archivo final tiene contenido
$finalSize = (Get-Item $backupFile).Length
if ($finalSize -le 20) {
    Write-Error "El archivo de backup final parece estar incompleto"
    exit 1
}

# Limpiar archivo temporal
if (Test-Path $tempBackupFile) {
    Remove-Item $tempBackupFile -Force
}

Write-Output "Backup completado en $backupFile"
Write-Output "Tamaño del archivo: $finalSize bytes"