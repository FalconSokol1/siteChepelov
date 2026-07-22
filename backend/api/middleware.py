"""Security headers middleware and CSP for production."""

from django.conf import settings


class SecurityHeadersMiddleware:
    """Adds CSP / Permissions-Policy and related hardening headers."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if getattr(settings, 'DEBUG', True):
            return response

        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://vk.ru https://vk.com https://id.vk.ru; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vk.ru https://vk.com; "
            "font-src 'self' https://fonts.gstatic.com data:; "
            "img-src 'self' data: blob: https:; "
            "connect-src 'self' https://kavkazkamen.ru https://admin.kavkazkamen.ru "
            "https://vk.ru https://vk.com https://api.vk.com https://api.vk.ru https://id.vk.ru https://login.vk.com; "
            "frame-src https://vk.ru https://vk.com https://id.vk.ru https://login.vk.com; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self' https://vk.ru https://vk.com https://id.vk.ru; "
            "object-src 'none'"
        )
        response.setdefault('Content-Security-Policy', csp)
        response.setdefault(
            'Permissions-Policy',
            'geolocation=(), microphone=(), camera=(), payment=()',
        )
        # allow-popups нужен для авторизации виджета сообщений VK
        response.setdefault('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
        return response
