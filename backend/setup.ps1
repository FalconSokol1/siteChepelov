$ErrorActionPreference = "Stop"
$backend = $PSScriptRoot

Write-Host ""
Write-Host "KavkazKamen Backend Setup" -ForegroundColor Cyan
Write-Host ""

Set-Location $backend

if (-not (Test-Path ".env")) {
    Write-Host "Creating .env with a secure secret key..." -ForegroundColor Yellow
    $secretKey = py -3 -c "import secrets; print(secrets.token_urlsafe(64))"
    @(
        "DJANGO_SECRET_KEY=$secretKey"
        "DJANGO_DEBUG=true"
        "DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost"
        "CORS_ALLOWED_ORIGINS=http://127.0.0.1:4000,http://localhost:4000"
        "CORS_ALLOW_ALL=false"
        "SECURE_SSL_REDIRECT=false"
        "SITE_URL=http://127.0.0.1:4000"
    ) | Set-Content -Path ".env" -Encoding UTF8
    Write-Host ".env created — do not commit this file." -ForegroundColor Green
}

Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
py -3 -m pip install -r requirements.txt -q

Write-Host "Applying migrations..." -ForegroundColor Yellow
py -3 manage.py migrate --noinput

if (-not (Test-Path "db.sqlite3")) {
    Write-Host "Database created." -ForegroundColor Green
}

$productCount = py -3 -c 'import django, os; os.environ.setdefault("DJANGO_SETTINGS_MODULE","kavkazkamen.settings"); django.setup(); from api.models import Product; print(Product.objects.count())' 2>$null

if (-not $productCount -or [int]$productCount -eq 0) {
    Write-Host "Seeding demo data..." -ForegroundColor Yellow
    py -3 manage.py seed_data
} else {
    Write-Host "Database already has $productCount products — skip seed." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "Backend ready. API: http://127.0.0.1:8000/api/" -ForegroundColor Green
Write-Host ""
