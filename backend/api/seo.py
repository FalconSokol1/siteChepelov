"""Helpers for robots.txt and sitemap.xml generation."""

from __future__ import annotations

from xml.sax.saxutils import escape

from django.conf import settings
from django.utils import timezone

from .models import Product, SitePage

# Legal pages that may exist as static fallbacks in the Angular app.
LEGAL_FALLBACK_SLUGS = (
    'privacy',
    'personal-data-consent',
    'marketing',
    'requisites',
    'recommendations',
    'offer',
    'promotions',
    'account',
)

CMS_ROUTE_MAP = {
    'home': '/',
    'catalog': '/catalog',
    'map': '/map',
    'reviews': '/reviews',
    'portfolio': '/portfolio',
}

CMS_SKIP_SLUGS = {'global', 'product'}


def site_url() -> str:
    return getattr(settings, 'SITE_URL', 'https://kavkazkamen.ru').rstrip('/')


def cms_slug_to_path(slug: str) -> str | None:
    if slug in CMS_SKIP_SLUGS:
        return None
    if slug.startswith('legal-'):
        return f'/legal/{slug.removeprefix("legal-")}'
    return CMS_ROUTE_MAP.get(slug)


def robots_txt() -> str:
    base = site_url()
    return '\n'.join(
        [
            'User-agent: *',
            'Allow: /',
            'Disallow: /manage/',
            'Disallow: /manage',
            'Disallow: /admin/',
            'Disallow: /admin',
            'Disallow: /api/',
            '',
            f'Sitemap: {base}/sitemap.xml',
            '',
        ]
    )


def _format_lastmod(value) -> str | None:
    if not value:
        return None
    if timezone.is_naive(value):
        value = timezone.make_aware(value, timezone.get_current_timezone())
    return value.date().isoformat()


def build_sitemap_entries() -> list[dict]:
    base = site_url()
    seen: set[str] = set()
    entries: list[dict] = []

    def add(path: str, *, lastmod=None, changefreq='monthly', priority='0.8'):
        if not path.startswith('/'):
            path = f'/{path}'
        loc = f'{base}{path}'
        if loc in seen:
            return
        seen.add(loc)
        entry = {
            'loc': loc,
            'changefreq': changefreq,
            'priority': priority,
        }
        formatted = _format_lastmod(lastmod)
        if formatted:
            entry['lastmod'] = formatted
        entries.append(entry)

    for page in SitePage.objects.filter(is_published=True).only('slug', 'updated_at'):
        path = cms_slug_to_path(page.slug)
        if not path:
            continue
        add(
            path,
            lastmod=page.updated_at,
            changefreq='weekly' if page.slug == 'home' else 'monthly',
            priority='1.0' if page.slug == 'home' else '0.8',
        )

    published_legal = {
        slug.removeprefix('legal-')
        for slug in SitePage.objects.filter(
            is_published=True,
            slug__startswith='legal-',
        ).values_list('slug', flat=True)
    }
    for slug in LEGAL_FALLBACK_SLUGS:
        if slug not in published_legal:
            add(f'/legal/{slug}', changefreq='yearly', priority='0.4')

    for slug in Product.objects.values_list('slug', flat=True):
        add(f'/catalog/{slug}', changefreq='weekly', priority='0.7')

    return entries


def sitemap_xml() -> str:
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for entry in build_sitemap_entries():
        lines.append('  <url>')
        lines.append(f'    <loc>{escape(entry["loc"])}</loc>')
        if entry.get('lastmod'):
            lines.append(f'    <lastmod>{entry["lastmod"]}</lastmod>')
        lines.append(f'    <changefreq>{entry["changefreq"]}</changefreq>')
        lines.append(f'    <priority>{entry["priority"]}</priority>')
        lines.append('  </url>')
    lines.append('</urlset>')
    return '\n'.join(lines) + '\n'
