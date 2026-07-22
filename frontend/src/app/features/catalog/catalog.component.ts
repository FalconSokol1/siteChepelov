import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError, of } from 'rxjs';
import {
  MATERIAL_LABELS,
  Material,
  Product,
  ProductType,
  STYLE_LABELS,
  Style,
  TYPE_LABELS,
} from '../../core/models';
import { FALLBACK_PRODUCTS } from '../../core/data/fallback-content';
import { ApiService } from '../../core/services/api.service';
import { CmsContentService } from '../../core/services/cms-content.service';
import { SeoService } from '../../core/services/seo.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { SelectOption, StyledSelectComponent } from '../../shared/styled-select/styled-select.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [FormsModule, HeaderComponent, ProductCardComponent, StyledSelectComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss',
})
export class CatalogComponent implements OnInit, OnDestroy {
  @ViewChild('productsScroll') productsScroll!: ElementRef<HTMLElement>;

  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  readonly cms = inject(CmsContentService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly page = signal(1);
  readonly filtersOpen = signal(false);
  readonly pageSize = 8;

  material = '';
  style = '';
  type = '';
  search = '';

  readonly materialOptions = Object.entries(MATERIAL_LABELS) as [Material, string][];
  readonly styleOptions = Object.entries(STYLE_LABELS) as [Style, string][];
  readonly typeOptions = Object.entries(TYPE_LABELS) as [ProductType, string][];

  ngOnInit(): void {
    this.cms.load('catalog').subscribe();
    this.seo.update({
      title: 'Каталог памятников — КавказКамень',
      description: 'Каталог памятников из гранита и мрамора. Производство и установка по всей России.',
      url: '/catalog',
    });
    this.seo.setJsonLd('catalog', {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Каталог памятников',
      url: 'https://kavkazkamen.ru/catalog',
    });
    this.seo.setJsonLd('catalog-breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://kavkazkamen.ru/' },
        { '@type': 'ListItem', position: 2, name: 'Каталог', item: 'https://kavkazkamen.ru/catalog' },
      ],
    });
    this.route.queryParams.subscribe((params) => {
      this.material = params['material'] || '';
      this.style = params['style'] || '';
      this.type = params['type'] || '';
      this.search = params['search'] || '';
      this.page.set(1);
      this.loadProducts();
    });
  }

  ngOnDestroy(): void {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  loadProducts(): void {
    this.loading.set(true);
    this.api
      .getProducts({
        material: (this.material as Material) || undefined,
        style: (this.style as Style) || undefined,
        type: (this.type as ProductType) || undefined,
        search: this.search || undefined,
      })
      .subscribe({
        next: (data) => {
          const hasFilters = !!(this.material || this.style || this.type || this.search);
          this.products.set(data.length || hasFilters ? data : FALLBACK_PRODUCTS);
          this.loading.set(false);
          this.scrollProductsToTop();
        },
        error: () => {
          this.products.set(FALLBACK_PRODUCTS);
          this.loading.set(false);
        },
      });
  }

  applyFilters(): void {
    this.page.set(1);
    this.loadProducts();
  }

  resetFilters(): void {
    this.material = '';
    this.style = '';
    this.type = '';
    this.search = '';
    this.page.set(1);
    this.loadProducts();
  }

  openFilters(): void {
    this.filtersOpen.set(true);
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  closeFilters(): void {
    this.filtersOpen.set(false);
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  activeFiltersCount(): number {
    return [this.material, this.style, this.type, this.search].filter(Boolean).length;
  }

  selectOptions(options: [string, string][], allLabel: string): SelectOption[] {
    return [{ value: '', label: allLabel }, ...options.map(([value, label]) => ({ value, label }))];
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.filtersOpen()) {
      this.closeFilters();
    }
  }

  paginatedProducts(): Product[] {
    const start = (this.page() - 1) * this.pageSize;
    return this.products().slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.products().length / this.pageSize));
  }

  setPage(p: number): void {
    if (p >= 1 && p <= this.totalPages()) {
      this.page.set(p);
      this.scrollProductsToTop();
    }
  }

  private scrollProductsToTop(): void {
    this.productsScroll?.nativeElement?.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
