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

GitHub → Settings → Secrets → Actions:

| Secret | Пример |
|--------|--------|
| `DEPLOY_HOST` | `201.51.12.106` |
| `DEPLOY_USER` | `root` |
| `DEPLOY_SSH_KEY` | приватный SSH-ключ |
| `DEPLOY_PORT` | `22` (необязательно) |

После настройки каждый `git push origin main` обновит сервер через `git pull`.
