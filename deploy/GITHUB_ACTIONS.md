# GitHub Actions CI/CD — настройка секретов

Репозиторий: https://github.com/FalconSokol1/siteChepelov

## Что уже есть

| Workflow | Когда | Что делает |
|----------|--------|------------|
| `.github/workflows/ci.yml` | push / PR в `main` | проверка Django + сборка Angular |
| `.github/workflows/deploy.yml` | push в `main` или вручную | заливка на сервер + migrate + restart |

## Секреты (обязательно для деплоя)

GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret | Пример | Описание |
|--------|--------|----------|
| `DEPLOY_HOST` | `201.51.12.106` | IP или hostname сервера |
| `DEPLOY_USER` | `root` | SSH-пользователь |
| `DEPLOY_SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | Приватный ключ целиком |
| `DEPLOY_PORT` | `22` | необязательно, по умолчанию 22 |

### Создать ключ на своём ПК

```powershell
ssh-keygen -t ed25519 -f $env:USERPROFILE\.ssh\kavkazkamen_deploy -N '""' -C "github-actions-deploy"
```

Публичный ключ на сервер:

```powershell
type $env:USERPROFILE\.ssh\kavkazkamen_deploy.pub | ssh root@201.51.12.106 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"
```

Приватный ключ (`kavkazkamen_deploy` без `.pub`) — целиком в секрет `DEPLOY_SSH_KEY`.

### Environment

В workflow указан `environment: production`.  
GitHub → **Settings** → **Environments** → создайте `production` (можно с approval перед деплоем).

## На сервере один раз

1. Установить nginx, python, node (см. README).
2. Создать `/var/www/kavkazkamen/backend/.env` (деплой **не** перезаписывает `.env`).
3. Открыть порты 22, 80, 443.
4. DNS → IP сервера.

После этого каждый `git push origin main` запускает CI и Deploy.
