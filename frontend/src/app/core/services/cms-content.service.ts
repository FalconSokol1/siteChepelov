import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, of, tap } from 'rxjs';
import { ContentBlock, SitePage } from '../models';
import { ApiService } from './api.service';
import { cmsSlugToPath, SeoService } from './seo.service';

type BlockField = 'title' | 'body' | 'image_url' | 'button_label' | 'button_url';

@Injectable({ providedIn: 'root' })
export class CmsContentService {
  private readonly api = inject(ApiService);
  private readonly seo = inject(SeoService);
  private readonly pagesState = signal<Record<string, SitePage>>({});
  private readonly pending = new Set<string>();

  load(slug: string): Observable<SitePage | null> {
    const cached = this.pagesState()[slug];
    if (cached) return of(cached);
    if (this.pending.has(slug)) return of(null);

    this.pending.add(slug);
    return this.api.getPage(slug).pipe(
      tap((page) => {
        this.pagesState.update((pages) => ({ ...pages, [slug]: page }));
        this.applySeo(page);
      }),
      catchError(() => of(null)),
      finalize(() => this.pending.delete(slug))
    );
  }

  page(slug: string): SitePage | undefined {
    return this.pagesState()[slug];
  }

  block(slug: string, key: string): ContentBlock | undefined {
    return this.page(slug)?.blocks.find((item) => item.key === key);
  }

  enabled(slug: string, key: string): boolean {
    return !this.page(slug) || !!this.block(slug, key);
  }

  blocks(slug: string, prefix?: string): ContentBlock[] {
    const blocks = this.page(slug)?.blocks ?? [];
    return prefix ? blocks.filter((item) => item.key.startsWith(prefix)) : blocks;
  }

  text(slug: string, key: string, field: BlockField, fallback = ''): string {
    const value = this.block(slug, key)?.[field];
    return typeof value === 'string' && value.length ? value : fallback;
  }

  data(slug: string, key: string, name: string, fallback = ''): string {
    const value = this.block(slug, key)?.extra_data?.[name];
    if (value === undefined || value === null || value === '') return fallback;
    return String(value);
  }

  paragraphs(body: string): string[] {
    return body
      .split(/\n\s*\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  applyPageSeo(
    page: SitePage,
    overrides: {
      title?: string;
      description?: string;
      url?: string;
      image?: string;
      type?: string;
    } = {}
  ): void {
    const path = overrides.url ?? cmsSlugToPath(page.slug) ?? undefined;
    if (page.slug === 'global') return;

    this.seo.update({
      title: overrides.title ?? page.meta_title,
      description: overrides.description ?? page.meta_description,
      url: path,
      image: overrides.image,
      type: overrides.type,
    });
  }

  private applySeo(page: SitePage): void {
    if (page.slug in { global: 1, product: 1 }) return;
    this.applyPageSeo(page);
  }
}
