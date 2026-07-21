from pathlib import Path

from kavkazkamen.env import env_bool, env_list, load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR)

SECRET_KEY = __import__('os').environ.get(
    'DJANGO_SECRET_KEY',
    'django-insecure-dev-only-do-not-use-in-production',
)

DEBUG = env_bool('DJANGO_DEBUG', True)

ALLOWED_HOSTS = env_list('DJANGO_ALLOWED_HOSTS', '127.0.0.1,localhost')
if DEBUG and '.cloudpub.ru' not in ALLOWED_HOSTS:
    ALLOWED_HOSTS = [*ALLOWED_HOSTS, '.cloudpub.ru']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'rest_framework.authtoken',
    'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'api.middleware.SecurityHeadersMiddleware',
]

ROOT_URLCONF = 'kavkazkamen.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'kavkazkamen.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'ru-ru'
TIME_ZONE = 'Europe/Moscow'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedStaticFilesStorage',
    },
}
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
# Staff uploads: max 8 MB per file
MANAGE_UPLOAD_MAX_BYTES = 8 * 1024 * 1024

SITE_URL = __import__('os').environ.get('SITE_URL', 'https://kavkazkamen.ru').rstrip('/')

# Behind nginx TLS termination
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True

# ─── CORS ───
_cors_origins = env_list(
    'CORS_ALLOWED_ORIGINS',
    'http://127.0.0.1:4000,http://localhost:4000,http://127.0.0.1:4200,http://localhost:4200,'
    'https://kavkazkamen.ru,https://www.kavkazkamen.ru,https://admin.kavkazkamen.ru',
)
CORS_ALLOWED_ORIGINS = _cors_origins
CORS_ALLOW_CREDENTIALS = True
# В DEBUG разрешаем любой поддомен cloudpub (туннель каждый раз новый)
CORS_ALLOWED_ORIGIN_REGEXES = [
    r'^https://[\w-]+\.cloudpub\.ru$',
] if DEBUG else []
CORS_ALLOW_ALL_ORIGINS = env_bool('CORS_ALLOW_ALL', False) and DEBUG

# ─── REST Framework ───
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '120/hour',
        'user': '600/hour',
        'auth': '10/minute',
        'consultation': '5/hour',
        'review': '10/day',
    },
}

if DEBUG:
    REST_FRAMEWORK['DEFAULT_THROTTLE_CLASSES'] = []
    REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'].append(
        'rest_framework.renderers.BrowsableAPIRenderer'
    )

CSRF_TRUSTED_ORIGINS = list(CORS_ALLOWED_ORIGINS)
if DEBUG:
    CSRF_TRUSTED_ORIGINS = [
        *CSRF_TRUSTED_ORIGINS,
        'https://*.cloudpub.ru',
    ]

# ─── Security headers (production) ───
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'

SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'

if not DEBUG:
    SECURE_SSL_REDIRECT = env_bool('SECURE_SSL_REDIRECT', True)
    SECURE_HSTS_SECONDS = 31_536_000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    # Do not force SSL redirect when running local gunicorn health checks without TLS
    if env_bool('SECURE_SSL_REDIRECT_DISABLED', False):
        SECURE_SSL_REDIRECT = False

# ─── Logging (auth failures, throttling) ───
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'loggers': {
        'django.security': {
            'handlers': ['console'],
            'level': 'WARNING',
        },
        'api.security': {
            'handlers': ['console'],
            'level': 'INFO',
        },
    },
}
