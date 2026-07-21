# KavkazKamen

Сайт памятников и мемориальных комплексов из гранита и мрамора.

**Публичный сайт:** https://kavkazkamen.ru  
**Админка CMS:** https://admin.kavkazkamen.ru/manage  
**Django Admin:** https://admin.kavkazkamen.ru/admin/

На публичном домене `/manage` и `/admin` закрыты (404).

## Быстрый запуск (локально)

```powershell
.\start.ps1
```

- **Сайт:** http://127.0.0.1:4000/
- **API:** http://127.0.0.1:8000/api/
- **CMS:** http://127.0.0.1:4000/manage

## Production-деплой

Требования: DNS A-записи `kavkazkamen.ru`, `www`, `admin` → IP сервера.

### CI/CD (рекомендуется)

Автосборка и выкладка через GitHub Actions — см. [`deploy/GITHUB_ACTIONS.md`](deploy/GITHUB_ACTIONS.md).

Нужны секреты репозитория: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`.

### Вручную

```bash
# с машины разработчика (нужен SSH и rsync)
bash deploy/deploy.sh root@201.51.12.106
```

Скрипт:
1. синхронизирует код в `/var/www/kavkazkamen`
2. ставит nginx, python venv, gunicorn, собирает Angular
3. поднимает `systemd` unit `kavkazkamen`
4. подключает nginx

После первого деплоя (пока без сертификатов) используется [`deploy/nginx-kavkazkamen.http.conf`](deploy/nginx-kavkazkamen.http.conf). Затем:

```bash
ssh root@201.51.12.106
certbot --nginx -d kavkazkamen.ru -d www.kavkazkamen.ru -d admin.kavkazkamen.ru
# затем скопировать TLS-конфиг:
cp /var/www/kavkazkamen/deploy/nginx-kavkazkamen.conf /etc/nginx/sites-available/kavkazkamen
nginx -t && systemctl reload nginx
```

Создать суперпользователя:

```bash
cd /var/www/kavkazkamen/backend
. .venv/bin/activate
python manage.py createsuperuser
```

## API (публичный)

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/health/` | Статус |
| GET | `/api/categories/` | Категории |
| GET | `/api/products/` | Товары |
| GET | `/api/products/<slug>/` | Карточка |
| GET | `/api/reviews/` | Отзывы (только чтение) |
| GET | `/api/portfolio/` | Портфолио |
| GET | `/api/locations/` | Офисы |
| GET | `/api/stats/` | Статистика |
| POST | `/api/auth/login/` | Вход **только staff** (для CMS) |

Отключено (410): заявки, регистрация, публичное создание отзывов.

## Безопасность

Production `.env` (создаётся деплоем автоматически):

```env
DJANGO_DEBUG=false
DJANGO_SECRET_KEY=<случайная строка>
DJANGO_ALLOWED_HOSTS=kavkazkamen.ru,www.kavkazkamen.ru,admin.kavkazkamen.ru
CORS_ALLOWED_ORIGINS=https://kavkazkamen.ru,https://www.kavkazkamen.ru,https://admin.kavkazkamen.ru
CORS_ALLOW_ALL=false
SECURE_SSL_REDIRECT=true
SITE_URL=https://kavkazkamen.ru
```

Включено: HSTS, Secure cookies, CSP, Permissions-Policy, proxy SSL headers, whitenoise, gunicorn на `127.0.0.1:8000`.
