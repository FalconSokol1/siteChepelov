# PowerShell helper for Windows. Full automated deploy: use Git Bash / WSL:
#   bash deploy/deploy.sh root@201.51.12.106

$ErrorActionPreference = 'Stop'
$Remote = if ($args.Count -gt 0) { $args[0] } else { 'root@201.51.12.106' }
$Root = Split-Path $PSScriptRoot -Parent

Write-Host "Project root: $Root"
Write-Host "Target: $Remote"
Write-Host ""
Write-Host "Need SSH key or password. From Git Bash / WSL:"
Write-Host "  bash deploy/deploy.sh $Remote"
Write-Host ""
Write-Host "DNS before TLS: kavkazkamen.ru, www, admin -> 201.51.12.106"
