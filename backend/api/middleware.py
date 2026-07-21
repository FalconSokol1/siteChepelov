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
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com data:; "
            "img-src 'self' data: blob: https:; "
            "connect-src 'self' https://kavkazkamen.ru https://admin.kavkazkamen.ru; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self'; "
            "object-src 'none'"
        )
        response.setdefault('Content-Security-Policy', csp)
        response.setdefault(
            'Permissions-Policy',
            'geolocation=(), microphone=(), camera=(), payment=()',
        )
        response.setdefault('Cross-Origin-Opener-Policy', 'same-origin')
        return response
