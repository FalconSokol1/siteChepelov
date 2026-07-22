# GitHub Actions CI/CD

Репозиторий: https://github.com/FalconSokol1/siteChepelov

## Как деплоим

Файлы **не копируются с ПК**. На сервере:

```bash
git clone https://github.com/FalconSokol1/siteChepelov.git /var/www/kavkazkamen
# дальше обновления:
cd /var/www/kavkazkamen && git fetch && git reset --hard origin/main
```

Сборка (`npm` / `pip`) идёт **на сервере**.

## Вручную с Windows

```powershell
cd "c:\Users\jtj68\OneDrive\Рабочий стол\сайт чепелов"
.\deploy\deploy.ps1
```

Скрипт только подключается по SSH и на сервере делает `git clone`/`git pull` + build + restart.

Или сами на сервере:

```bash
ssh root@201.51.12.106
cd /var/www
git clone https://github.com/FalconSokol1/siteChepelov.git kavkazkamen
# если уже есть:
cd /var/www/kavkazkamen && git pull
```

## Секреты для автодеплоя (Actions)

GitHub → **Settings → Secrets and variables → Actions** (или Environment `production`):

| Secret | Пример |
|--------|--------|
| `DEPLOY_HOST` | `201.51.12.106` |
| `DEPLOY_USER` | `root` |
| `DEPLOY_SSH_KEY` | **base64** приватного ключа |
| `DEPLOY_PORT` | `22` (необязательно) |

### Как правильно создать ключ (Windows PowerShell)

Ошибка `libcrypto` почти всегда из‑за битого ключа в секрете (пропали переносы строк при вставке).

```powershell
# 1) Новый ключ БЕЗ пароля
ssh-keygen -t ed25519 -C "github-actions-kavkazkamen" -f $env:USERPROFILE\.ssh\kavkazkamen_deploy -N '""'

# 2) Публичный — на сервер в authorized_keys
Get-Content $env:USERPROFILE\.ssh\kavkazkamen_deploy.pub

# 3) Для GitHub — base64 в буфер обмена
[Convert]::ToBase64String([IO.File]::ReadAllBytes("$env:USERPROFILE\.ssh\kavkazkamen_deploy")) | Set-Clipboard
Write-Host "Base64 скопирован — вставь в секрет DEPLOY_SSH_KEY"
```

На сервере:

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo 'СЮДА_СТРОКУ_ИЗ_.pub' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Проверка с ПК:

```powershell
ssh -i $env:USERPROFILE\.ssh\kavkazkamen_deploy root@201.51.12.106 "echo OK"
```

После настройки: **Actions → Deploy → Run workflow**.
