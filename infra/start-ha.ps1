param(
    [string]$EnvFilePath = ".\llantapp-backend\.env"
)

$ErrorActionPreference = "Stop"

Write-Host "== Cargando variables desde $EnvFilePath =="

if (!(Test-Path $EnvFilePath)) {
    throw "No se encontró el archivo $EnvFilePath"
}

# Cargar .env en variables de entorno del PROCESO actual
Get-Content $EnvFilePath | ForEach-Object {
    $line = $_.Trim()
    if (-not $line) { return }
    if ($line.StartsWith("#")) { return }
    if ($line -notmatch "=") { return }

    $parts = $line -split "=", 2
    $name = $parts[0].Trim()
    $value = $parts[1].Trim()

    # Quitar comentario inline si NO está entre comillas
    if (-not ($value.StartsWith('"') -and $value.EndsWith('"'))) {
        $hashIndex = $value.IndexOf("#")
        if ($hashIndex -ge 0) {
            $value = $value.Substring(0, $hashIndex).Trim()
        }
    }

    # Quitar comillas envolventes
    if ($value.StartsWith('"') -and $value.EndsWith('"')) {
        $value = $value.Substring(1, $value.Length - 2)
    }

    if ($name -ne "") {
        Set-Item -Path "Env:$name" -Value $value
    }
}

# Defaults si faltan
if (-not $env:LLANTAPP_DB_SUPERUSER) { $env:LLANTAPP_DB_SUPERUSER = "postgres" }
if (-not $env:LLANTAPP_DB_SUPERUSER_PASSWORD) { $env:LLANTAPP_DB_SUPERUSER_PASSWORD = "1234" }
if (-not $env:LLANTAPP_DB_REPL_USER) { $env:LLANTAPP_DB_REPL_USER = "replicator" }
if (-not $env:LLANTAPP_DB_REPL_PASSWORD) { $env:LLANTAPP_DB_REPL_PASSWORD = "replicator" }
if (-not $env:LLANTAPP_DATA_DIR_ROOT) { $env:LLANTAPP_DATA_DIR_ROOT = "C:/llantapp/patroni" }
if (-not $env:LLANTAPP_DB_PORT_WRITE) { $env:LLANTAPP_DB_PORT_WRITE = "15432" }
if (-not $env:LLANTAPP_DB_PORT_READ) { $env:LLANTAPP_DB_PORT_READ = "15435" }

# Patroni env oficiales
$env:PATRONI_SCOPE = "llantapp"
$env:PATRONI_SUPERUSER_USERNAME = $env:LLANTAPP_DB_SUPERUSER
$env:PATRONI_SUPERUSER_PASSWORD = $env:LLANTAPP_DB_SUPERUSER_PASSWORD
$env:PATRONI_REPLICATION_USERNAME = $env:LLANTAPP_DB_REPL_USER
$env:PATRONI_REPLICATION_PASSWORD = $env:LLANTAPP_DB_REPL_PASSWORD

if ($env:LLANTAPP_PG_BIN_DIR) {
    $env:PATRONI_POSTGRESQL_BIN_DIR = $env:LLANTAPP_PG_BIN_DIR
}

# Crear data dirs
$root = $env:LLANTAPP_DATA_DIR_ROOT
$node1 = Join-Path $root "node1\data"
$node2 = Join-Path $root "node2\data"
$node3 = Join-Path $root "node3\data"

$dirs = @($node1, $node2, $node3)
foreach ($d in $dirs) {
    if (!(Test-Path $d)) {
        New-Item -ItemType Directory -Force -Path $d | Out-Null
    }
}

# Rutas repo y configs
$repoRoot = Resolve-Path "$PSScriptRoot\.."
$patroniExe = Join-Path $repoRoot ".venv\Scripts\patroni.exe"
if (!(Test-Path $patroniExe)) {
    throw "No se encontró $patroniExe. Activa el venv e instala patroni (pip install 'patroni[raft,psycopg2-binary]')."
}

$node1Cfg = Join-Path $repoRoot "infra\patroni\node1.yml"
$node2Cfg = Join-Path $repoRoot "infra\patroni\node2.yml"
$node3Cfg = Join-Path $repoRoot "infra\patroni\node3.yml"

Write-Host "== Iniciando Patroni node1 =="
Start-Process -FilePath $patroniExe -ArgumentList "`"$node1Cfg`"" -WorkingDirectory $repoRoot -WindowStyle Minimized

Write-Host "== Iniciando Patroni node2 =="
Start-Process -FilePath $patroniExe -ArgumentList "`"$node2Cfg`"" -WorkingDirectory $repoRoot -WindowStyle Minimized

Write-Host "== Iniciando Patroni node3 =="
Start-Process -FilePath $patroniExe -ArgumentList "`"$node3Cfg`"" -WorkingDirectory $repoRoot -WindowStyle Minimized

# Lanzar HAProxy
$haproxyCfg = Join-Path $repoRoot "infra\haproxy\haproxy.cfg"
$haproxyExe = $env:LLANTAPP_HAPROXY_BIN
if (-not $haproxyExe -or -not (Test-Path $haproxyExe)) {
    # Si no hay ruta en .env, intentar usar haproxy del PATH
    $haproxyExe = "haproxy.exe"
}

if (!(Get-Command $haproxyExe -ErrorAction SilentlyContinue)) {
    Write-Warning "HAProxy no encontrado. Instálalo o ajusta LLANTAPP_HAPROXY_BIN en .env"
} else {
    Write-Host "== Iniciando HAProxy =="
    Start-Process -FilePath $haproxyExe -ArgumentList "-f `"$haproxyCfg`"" -WorkingDirectory $repoRoot -WindowStyle Minimized
}

Write-Host "== Listo. Cluster Patroni iniciándose y HAProxy escuchando en =="
Write-Host "   WRITE: localhost:$($env:LLANTAPP_DB_PORT_WRITE)"
Write-Host "   READ : localhost:$($env:LLANTAPP_DB_PORT_READ)"