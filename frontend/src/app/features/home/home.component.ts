import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import {
  Category,
  OfficeLocation,
  PortfolioItem,
  Product,
  Review,
} from '../../core/models';
import {
  FALLBACK_CATEGORIES,
  FALLBACK_LOCATIONS,
  FALLBACK_PORTFOLIO,
  FALLBACK_PRODUCTS,
  FALLBACK_REVIEWS,
} from '../../core/data/fallback-content';
import { COMPANY } from '../../core/data/company';
import { ApiService } from '../../core/services/api.service';
import { CmsContentService } from '../../core/services/cms-content.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { MonumentSceneComponent } from '../../shared/monument-scene/monument-scene.component';
import { RegionShowcaseComponent } from '../../shared/region-showcase/region-showcase.component';
import {
  ProcessStep,
  ProcessTimelineComponent,
} from '../../shared/process-timeline/process-timeline.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    HeaderComponent,
    FooterComponent,
    MonumentSceneComponent,
    RegionShowcaseComponent,
    ProcessTimelineComponent,
    ProductCardComponent,
    ScrollRevealDirective,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly seo = inject(SeoService);
  readonly cms = inject(CmsContentService);
  readonly company = COMPANY;

  readonly categories = signal<Category[]>(FALLBACK_CATEGORIES);
  readonly featuredProducts = signal<Product[]>(FALLBACK_PRODUCTS);
  readonly reviews = signal<Review[]>(FALLBACK_REVIEWS);
  readonly portfolio = signal<PortfolioItem[]>(FALLBACK_PORTFOLIO);
  readonly locations = signal<OfficeLocation[]>(FALLBACK_LOCATIONS);
  readonly selectedRegionCity = signal<number | null>(FALLBACK_LOCATIONS[0].id);
  readonly heroTitle = signal(
    'КавказКамень — изготовление, производство и установка памятников по всей России'
  );
  readonly heroLead = signal('Выполняем заказы от эскиза до монтажа под ключ.');
  readonly heroButtonLabel = signal('Получить каталог');
  readonly heroButtonUrl = signal('/catalog');

  processSteps: ProcessStep[] = [
    { id: 'consult', title: 'Консультация', desc: 'Обсуждаем пожелания, материал и бюджет' },
    { id: 'design', title: 'Проектирование', desc: '3D-визуализация и согласование эскиза' },
    { id: 'factory', title: 'Производство', desc: 'Резка, полировка, гравировка на собственном заводе' },
    { id: 'delivery', title: 'Доставка', desc: 'Бережная транспортировка по краю и Адыгее' },
    { id: 'install', title: 'Установка', desc: 'Монтаж с гарантией качества' },
  ];

  materials = [
    { name: 'Гранит', origin: 'Карелия, Россия', hardness: '7/10', frost: '-40°C', price: 'от 24 500 ₽' },
    { name: 'Мрамор', origin: 'Коелга, Россия', hardness: '3/10', frost: '-20°C', price: 'от 18 200 ₽' },
    { name: 'Габбро-диабаз', origin: 'Карелия, Россия', hardness: '8/10', frost: '-50°C', price: 'от 22 000 ₽' },
    { name: 'Лабрадорит', origin: 'Мурманская обл.', hardness: '7/10', frost: '-45°C', price: 'от 28 000 ₽' },
  ];

  ngOnInit(): void {
    this.loadData();
    this.seo.update({
      title: 'КавказКамень — памятники из гранита и мрамора',
      description:
        'Производство и установка памятников по всей России. Офис в пос. Родники, Краснодарский край.',
      url: '/',
      type: 'website',
    });
    this.seo.setJsonLd('organization', {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'КавказКамень',
      legalName: COMPANY.name,
      description: 'Производство и установка памятников из гранита и мрамора',
      url: COMPANY.siteUrl,
      telephone: COMPANY.phone,
      email: COMPANY.email,
      image: `${COMPANY.siteUrl}/logo.png`,
      priceRange: '₽₽',
      openingHours: 'Mo-Sa 09:00-19:00',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'ул. Лесная, 70',
        addressLocality: 'пос. Родники',
        addressRegion: 'Краснодарский край',
        postalCode: '352601',
        addressCountry: 'RU',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 44.7506,
        longitude: 39.9149,
      },
      areaServed: 'RU',
    });
  }

  loadData(): void {
    this.cms.load('home').subscribe((page) => {
      const hero = page?.blocks.find((block) => block.key === 'hero');
      if (!hero) return;
      if (hero.title) this.heroTitle.set(hero.title);
      if (hero.body) this.heroLead.set(hero.body);
      if (hero.button_label) this.heroButtonLabel.set(hero.button_label);
      if (hero.button_url) this.heroButtonUrl.set(hero.button_url);

      const processBlocks = page?.blocks.filter((block) => block.key.startsWith('process-')) ?? [];
      if (processBlocks.length) {
        this.processSteps = processBlocks.map((block) => ({
          id: block.key.replace('process-', ''),
          title: block.title,
          desc: block.body,
        }));
      }

      const materialBlocks = page?.blocks.filter((block) => block.key.startsWith('material-')) ?? [];
      if (materialBlocks.length) {
        this.materials = materialBlocks.map((block) => ({
          name: block.title,
          origin: String(block.extra_data['origin'] ?? ''),
          hardness: String(block.extra_data['hardness'] ?? ''),
          frost: String(block.extra_data['frost'] ?? ''),
          price: String(block.extra_data['price'] ?? ''),
        }));
      }
    });

    this.api.getCategories().pipe(catchError(() => of(FALLBACK_CATEGORIES))).subscribe((d) => {
      this.categories.set((d.length ? d : FALLBACK_CATEGORIES).slice(0, 8));
    });
    this.api.getProducts({ featured: true }).pipe(catchError(() => of(FALLBACK_PRODUCTS))).subscribe((d) => {
      this.featuredProducts.set((d.length ? d : FALLBACK_PRODUCTS).slice(0, 4));
    });
    this.api.getReviews().pipe(catchError(() => of(FALLBACK_REVIEWS))).subscribe((d) => {
      this.reviews.set(d.length ? d : FALLBACK_REVIEWS);
    });
    this.api.getPortfolio().pipe(catchError(() => of(FALLBACK_PORTFOLIO))).subscribe((d) => {
      this.portfolio.set(d.length ? d : FALLBACK_PORTFOLIO);
    });
    this.api.getLocations().pipe(catchError(() => of(FALLBACK_LOCATIONS))).subscribe((d) => {
      const list = d.length ? d : FALLBACK_LOCATIONS;
      this.locations.set(list);
      const hq = list.find((l) => l.is_headquarters) ?? list[0];
      if (hq) this.selectedRegionCity.set(hq.id);
    });
  }

  selectRegionCity(loc: OfficeLocation): void {
    this.selectedRegionCity.set(loc.id);
  }
}
