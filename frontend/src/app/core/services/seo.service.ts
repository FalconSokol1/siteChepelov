import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface SeoConfig {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  robots?: string;
}

const DEFAULT_TITLE = 'КавказКамень - производство и установка памятников';
const DEFAULT_DESCRIPTION =
  'КавказКамень — производство и установка памятников из гранита и мрамора. пос. Родники, Краснодарский край. Доставка и монтаж по всей России.';
const DEFAULT_IMAGE = '/android-chrome-512x512.png';

export function cmsSlugToPath(slug: string): string | null {
  if (slug === 'global' || slug === 'product') return null;
  if (slug === 'home') return '/';
  if (slug.startsWith('legal-')) return `/legal/${slug.slice(6)}`;
  const map: Record<string, string> = {
    catalog: '/catalog',
    map: '/map',
    reviews: '/reviews',
    portfolio: '/portfolio',
  };
  return map[slug] ?? null;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly doc = inject(DOCUMENT);
  private readonly siteUrl = environment.siteUrl.replace(/\/$/, '');

  update(config: SeoConfig = {}): void {
    const title = config.title?.trim() || DEFAULT_TITLE;
    const description = config.description?.trim() || DEFAULT_DESCRIPTION;
    const image = this.absUrl(config.image || DEFAULT_IMAGE);
    const url = this.absUrl(config.url || '/');
    const type = config.type || 'website';
    const robots = config.robots || 'index, follow';

    this.doc.title = title;
    this.setMeta('name', 'description', description);
    this.setMeta('name', 'robots', robots);
    this.setMeta('property', 'og:title', title);
    this.setMeta('property', 'og:description', description);
    this.setMeta('property', 'og:image', image);
    this.setMeta('property', 'og:url', url);
    this.setMeta('property', 'og:type', type);
    this.setMeta('property', 'og:locale', 'ru_RU');
    this.setMeta('property', 'og:site_name', 'КавказКамень');
    this.setMeta('name', 'twitter:card', 'summary_large_image');
    this.setMeta('name', 'twitter:title', title);
    this.setMeta('name', 'twitter:description', description);
    this.setMeta('name', 'twitter:image', image);
    this.setLink('canonical', url);
  }

  setNoIndex(): void {
    this.update({ robots: 'noindex, nofollow' });
  }

  setJsonLd(id: string, data: Record<string, unknown>): void {
    const scriptId = `jsonld-${id}`;
    let el = this.doc.getElementById(scriptId) as HTMLScriptElement | null;
    if (!el) {
      el = this.doc.createElement('script');
      el.id = scriptId;
      el.type = 'application/ld+json';
      this.doc.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  }

  removeJsonLd(id: string): void {
    this.doc.getElementById(`jsonld-${id}`)?.remove();
  }

  private absUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) return path;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${this.siteUrl}${normalized}`;
  }

  private setMeta(attr: 'name' | 'property', key: string, content: string): void {
    let el = this.doc.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (!el) {
      el = this.doc.createElement('meta');
      el.setAttribute(attr, key);
      this.doc.head.appendChild(el);
    }
    el.content = content;
  }

  private setLink(rel: string, href: string): void {
    let el = this.doc.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!el) {
      el = this.doc.createElement('link');
      el.rel = rel;
      this.doc.head.appendChild(el);
    }
    el.href = href;
  }
}
