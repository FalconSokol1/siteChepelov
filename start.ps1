$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

Write-Host ""
Write-Host "KavkazKamen" -ForegroundColor Cyan
Write-Host "  Site: http://127.0.0.1:4000/ (tunnel: allowedHosts .cloudpub.ru)" -ForegroundColor Green
Write-Host "  API:  http://127.0.0.1:8000/api/" -ForegroundColor Green
Write-Host ""

& (Join-Path $backend "setup.ps1")

Get-CimInstance Win32_Process -Filter "Name='python.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -like '*manage.py runserver*' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

Get-NetTCPConnection -LocalPort 4000 -State Listen -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

Start-Sleep -Seconds 1

$backendUp = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
if (-not $backendUp) {
  Write-Host "Starting backend..." -ForegroundColor Yellow
  Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$backend'; py -3 manage.py runserver 127.0.0.1:8000 --noreload"
  ) -WindowStyle Minimized
  Start-Sleep -Seconds 3
}

Set-Location $frontend
npm start
