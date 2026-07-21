#!/usr/bin/env bash
# Deploy KavkazKamen to production server.
# Usage (from project root on CI/local with SSH access):
#   bash deploy/deploy.sh root@201.51.12.106
set -euo pipefail

REMOTE="${1:-root@201.51.12.106}"
APP_DIR="/var/www/kavkazkamen"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "==> Sync project to ${REMOTE}:${APP_DIR}"
ssh "$REMOTE" "mkdir -p ${APP_DIR}"
rsync -az --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude 'frontend/dist' \
  --exclude 'backend/.venv' \
  --exclude 'backend/db.sqlite3' \
  --exclude 'backend/media' \
  --exclude 'backend/staticfiles' \
  --exclude '__pycache__' \
  --exclude '.env' \
  "$ROOT_DIR/" "${REMOTE}:${APP_DIR}/"

echo "==> Remote setup"
ssh "$REMOTE" bash -s <<EOF
set -euo pipefail
cd ${APP_DIR}

# System packages (idempotent)
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nginx python3 python3-venv python3-pip certbot python3-certbot-nginx curl

# Node for frontend build
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi

# Backend venv
cd ${APP_DIR}/backend
python3 -m venv .venv
. .venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt

if [ ! -f .env ]; then
  SECRET=\$(python3 -c 'import secrets; print(secrets.token_urlsafe(64))')
  cat > .env <<ENV
DJANGO_SECRET_KEY=\${SECRET}
DJANGO_DEBUG=false
DJANGO_ALLOWED_HOSTS=kavkazkamen.ru,www.kavkazkamen.ru,admin.kavkazkamen.ru,127.0.0.1
CORS_ALLOWED_ORIGINS=https://kavkazkamen.ru,https://www.kavkazkamen.ru,https://admin.kavkazkamen.ru
CORS_ALLOW_ALL=false
SECURE_SSL_REDIRECT=false
SITE_URL=https://kavkazkamen.ru
ENV
  echo "Created backend/.env"
fi

python manage.py migrate --noinput
python manage.py collectstatic --noinput
mkdir -p media
chown -R www-data:www-data ${APP_DIR}/backend/media ${APP_DIR}/backend/staticfiles || true

# Frontend build
cd ${APP_DIR}/frontend
npm ci --prefer-offline || npm install
npm run build -- --configuration=production

# systemd
cp ${APP_DIR}/deploy/kavkazkamen.service /etc/systemd/system/kavkazkamen.service
systemctl daemon-reload
systemctl enable kavkazkamen
systemctl restart kavkazkamen

# nginx (HTTP bootstrap first)
cp ${APP_DIR}/deploy/nginx-kavkazkamen.http.conf /etc/nginx/sites-available/kavkazkamen
ln -sfn /etc/nginx/sites-available/kavkazkamen /etc/nginx/sites-enabled/kavkazkamen
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# TLS if DNS already points here
if command -v certbot >/dev/null 2>&1; then
  certbot --nginx -d kavkazkamen.ru -d www.kavkazkamen.ru -d admin.kavkazkamen.ru \
    --non-interactive --agree-tos -m info@chepelov.ru --redirect || true
  if [ -f /etc/letsencrypt/live/kavkazkamen.ru/fullchain.pem ]; then
    cp ${APP_DIR}/deploy/nginx-kavkazkamen.conf /etc/nginx/sites-available/kavkazkamen
    sed -i 's/^SECURE_SSL_REDIRECT=.*/SECURE_SSL_REDIRECT=true/' ${APP_DIR}/backend/.env || true
    systemctl restart kavkazkamen
    nginx -t && systemctl reload nginx || true
  fi
fi

echo "==> Deploy complete"
echo "Public: http://kavkazkamen.ru  Admin: http://admin.kavkazkamen.ru/manage"
EOF

echo "==> Deploy finished"