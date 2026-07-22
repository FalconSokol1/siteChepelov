import { Component, OnInit, inject, signal } from '@angular/core';
import { Review } from '../../core/models';
import { ApiService } from '../../core/services/api.service';
import { CmsContentService } from '../../core/services/cms-content.service';
import { SeoService } from '../../core/services/seo.service';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.scss',
})
export class ReviewsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly seo = inject(SeoService);
  readonly cms = inject(CmsContentService);

  readonly reviews = signal<Review[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.cms.load('reviews').subscribe();
    this.seo.update({
      title: 'Отзывы клиентов — КавказКамень',
      description: 'Отзывы клиентов о памятниках и работе КавказКамень.',
      url: '/reviews',
    });
    this.seo.setJsonLd('reviews-page', {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Отзывы клиентов',
      url: 'https://kavkazkamen.ru/reviews',
      isPartOf: { '@type': 'WebSite', name: 'КавказКамень', url: 'https://kavkazkamen.ru' },
    });
    this.loadReviews();
  }

  loadReviews(): void {
    this.api.getReviews().subscribe({
      next: (data) => {
        this.reviews.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  stars(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }
}
