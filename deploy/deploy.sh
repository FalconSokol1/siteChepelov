#!/usr/bin/env bash
# Deploy on the server via git clone / git pull (no local rsync).
# Usage:
#   bash deploy/deploy.sh
#   bash deploy/deploy.sh root@201.51.12.106
set -euo pipefail

REMOTE="${1:-root@201.51.12.106}"
APP_DIR="/var/www/kavkazkamen"
REPO_URL="https://github.com/FalconSokol1/siteChepelov.git"

echo "==> Deploy on ${REMOTE} from ${REPO_URL}"

ssh "$REMOTE" bash -s <<EOF
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

apt-get update -qq
apt-get install -y -qq nginx python3 python3-venv python3-pip certbot python3-certbot-nginx curl git

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi

mkdir -p /var/www
if [ ! -d "${APP_DIR}/.git" ]; then
  rm -rf "${APP_DIR}"
  git clone "${REPO_URL}" "${APP_DIR}"
else
  cd "${APP_DIR}"
  git fetch origin
  git reset --hard origin/main
fi

cd "${APP_DIR}/backend"
python3 -m venv .venv
source .venv/bin/activate
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
  echo "Created backend/.env — edit secrets if needed"
fi

python manage.py migrate --noinput
python manage.py collectstatic --noinput
mkdir -p media
chown -R www-data:www-data media staticfiles 2>/dev/null || true

cd "${APP_DIR}/frontend"
npm ci --prefer-offline || npm install
npm run build -- --configuration=production

cp "${APP_DIR}/deploy/kavkazkamen.service" /etc/systemd/system/kavkazkamen.service
systemctl daemon-reload
systemctl enable kavkazkamen
systemctl restart kavkazkamen

if [ -f /etc/letsencrypt/live/kavkazkamen.ru/fullchain.pem ]; then
  cp "${APP_DIR}/deploy/nginx-kavkazkamen.conf" /etc/nginx/sites-available/kavkazkamen
else
  cp "${APP_DIR}/deploy/nginx-kavkazkamen.http.conf" /etc/nginx/sites-available/kavkazkamen
fi
ln -sfn /etc/nginx/sites-available/kavkazkamen /etc/nginx/sites-enabled/kavkazkamen
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

curl -fsS http://127.0.0.1:8000/api/health/ || true
echo "==> Deploy complete"
EOF
