import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { COMPANY } from '../../core/data/company';
import {
  CART_EXTRA_SERVICES,
  MATERIAL_LABELS,
  Product,
  STYLE_LABELS,
  TYPE_LABELS,
} from '../../core/models';
import { ApiService } from '../../core/services/api.service';
import { CmsContentService } from '../../core/services/cms-content.service';
import { SeoService } from '../../core/services/seo.service';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly seo = inject(SeoService);
  readonly cms = inject(CmsContentService);

  readonly company = COMPANY;
  readonly extras = signal(CART_EXTRA_SERVICES);
  readonly product = signal<Product | null>(null);
  readonly selectedImage = signal('');
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly extrasOpen = signal(false);

  readonly materialLabels = MATERIAL_LABELS;
  readonly styleLabels = STYLE_LABELS;
  readonly typeLabels = TYPE_LABELS;

  ngOnInit(): void {
    this.cms.load('product').subscribe();
    this.cms.load('global').subscribe();
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (!slug) {
        this.notFound.set(true);
        this.loading.set(false);
        return;
      }
      this.loading.set(true);
      this.notFound.set(false);
      this.extrasOpen.set(false);
      this.api.getProduct(slug).subscribe({
        next: (p) => {
          this.product.set(p);
          this.selectedImage.set(this.galleryImages(p)[0] ?? p.image_url);
          this.extras.set(
            p.extra_services?.length
              ? p.extra_services.map((s) => ({
                  id: String(s.id),
                  title: s.title,
                  description: s.description,
                  price: s.price ?? 0,
                }))
              : CART_EXTRA_SERVICES
          );
          const description =
            p.description?.trim() ||
            `${p.name} из ${p.material_label}. Цена от ${p.price.toLocaleString('ru-RU')} ₽. Производство и установка памятников КавказКамень.`;
          this.seo.update({
            title: `${p.name} — КавказКамень`,
            description: description.slice(0, 300),
            image: p.image_url,
            url: `/catalog/${p.slug}`,
            type: 'product',
          });
          this.seo.setJsonLd('product', {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: p.name,
            description: description.slice(0, 500),
            image: p.image_url,
            sku: p.sku,
            brand: { '@type': 'Brand', name: 'КавказКамень' },
            offers: {
              '@type': 'Offer',
              url: `${COMPANY.siteUrl}/catalog/${p.slug}`,
              priceCurrency: 'RUB',
              price: p.price,
              availability: 'https://schema.org/InStock',
            },
          });
          this.seo.setJsonLd('breadcrumb', {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Главная', item: COMPANY.siteUrl },
              { '@type': 'ListItem', position: 2, name: 'Каталог', item: `${COMPANY.siteUrl}/catalog` },
              {
                '@type': 'ListItem',
                position: 3,
                name: p.name,
                item: `${COMPANY.siteUrl}/catalog/${p.slug}`,
              },
            ],
          });
          this.loading.set(false);
        },
        error: () => {
          this.product.set(null);
          this.notFound.set(true);
          this.loading.set(false);
        },
      });
    });
  }

  toggleExtras(): void {
    this.extrasOpen.update((v) => !v);
  }

  galleryImages(product: Product): string[] {
    const urls = [
      product.image_url,
      ...(product.images ?? []).map((image) => image.image_url),
    ].filter(Boolean);
    return [...new Set(urls)];
  }

  selectImage(imageUrl: string): void {
    this.selectedImage.set(imageUrl);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.extrasOpen()) this.extrasOpen.set(false);
  }

  formatPrice(price: number): string {
    return price.toLocaleString('ru-RU') + ' ₽';
  }

  materialLabel(key: string): string {
    return this.materialLabels[key as keyof typeof this.materialLabels] ?? key;
  }

  styleLabel(key: string): string {
    return this.styleLabels[key as keyof typeof this.styleLabels] ?? key;
  }

  typeLabel(key: string): string {
    return this.typeLabels[key as keyof typeof this.typeLabels] ?? key;
  }
}
