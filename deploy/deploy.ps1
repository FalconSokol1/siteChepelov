# Deploy via SSH: git clone/pull on the server (no rsync/scp of project files).
# Usage:
#   .\deploy\deploy.ps1
#   .\deploy\deploy.ps1 root@201.51.12.106

$ErrorActionPreference = 'Stop'
$Remote = if ($args.Count -gt 0) { $args[0] } else { 'root@201.51.12.106' }
$RepoUrl = 'https://github.com/FalconSokol1/siteChepelov.git'
$AppDir = '/var/www/kavkazkamen'

Write-Host "Deploy on $Remote from $RepoUrl (git on server)" -ForegroundColor Cyan
Write-Host "You will be asked for the SSH password." -ForegroundColor Yellow
Write-Host ""

$remoteScript = @"
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

apt-get update -qq
apt-get install -y -qq nginx python3 python3-venv python3-pip certbot python3-certbot-nginx curl git

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi

mkdir -p /var/www
if [ ! -d '$AppDir/.git' ]; then
  rm -rf '$AppDir'
  git clone '$RepoUrl' '$AppDir'
else
  cd '$AppDir'
  git fetch origin
  git reset --hard origin/main
fi

cd '$AppDir/backend'
python3 -m venv .venv
source .venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt

if [ ! -f .env ]; then
  SECRET=`$(python3 -c 'import secrets; print(secrets.token_urlsafe(64))')
  cat > .env <<ENV
DJANGO_SECRET_KEY=`$SECRET
DJANGO_DEBUG=false
DJANGO_ALLOWED_HOSTS=kavkazkamen.ru,www.kavkazkamen.ru,admin.kavkazkamen.ru,127.0.0.1
CORS_ALLOWED_ORIGINS=https://kavkazkamen.ru,https://www.kavkazkamen.ru,https://admin.kavkazkamen.ru
CORS_ALLOW_ALL=false
SECURE_SSL_REDIRECT=false
SITE_URL=https://kavkazkamen.ru
ENV
  echo 'Created backend/.env'
fi

python manage.py migrate --noinput
python manage.py seed_data
python manage.py collectstatic --noinput
mkdir -p media
chown -R www-data:www-data media staticfiles 2>/dev/null || true

cd '$AppDir/frontend'
npm ci --prefer-offline || npm install
npm run build -- --configuration=production

cp '$AppDir/deploy/kavkazkamen.service' /etc/systemd/system/kavkazkamen.service
systemctl daemon-reload
systemctl enable kavkazkamen
systemctl restart kavkazkamen

if [ -f /etc/letsencrypt/live/kavkazkamen.ru/fullchain.pem ]; then
  cp '$AppDir/deploy/nginx-kavkazkamen.conf' /etc/nginx/sites-available/kavkazkamen
else
  cp '$AppDir/deploy/nginx-kavkazkamen.http.conf' /etc/nginx/sites-available/kavkazkamen
fi
ln -sfn /etc/nginx/sites-available/kavkazkamen /etc/nginx/sites-enabled/kavkazkamen
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
curl -fsS http://127.0.0.1:8000/api/health/ || true
echo 'Deploy complete'
"@

# Write script to temp and pipe via ssh bash
$tmp = Join-Path $env:TEMP 'kavkazkamen-remote-deploy.sh'
# Normalize to LF for bash on Linux
$remoteScript.Replace("`r`n", "`n") | Set-Content -Path $tmp -Encoding utf8NoBOM -NoNewline
Get-Content $tmp -Raw | ssh $Remote "bash -s"
Remove-Item $tmp -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Done. Check: http://kavkazkamen.ru  and  http://admin.kavkazkamen.ru/manage" -ForegroundColor Green
