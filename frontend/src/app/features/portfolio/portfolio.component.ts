import { Component, OnInit, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { PortfolioItem } from '../../core/models';
import { FALLBACK_PORTFOLIO } from '../../core/data/fallback-content';
import { ApiService } from '../../core/services/api.service';
import { CmsContentService } from '../../core/services/cms-content.service';
import { SeoService } from '../../core/services/seo.service';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss',
})
export class PortfolioComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly seo = inject(SeoService);
  readonly cms = inject(CmsContentService);
  readonly items = signal<PortfolioItem[]>(FALLBACK_PORTFOLIO);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.cms.load('portfolio').subscribe();
    this.seo.update({
      title: 'Портфолио — КавказКамень',
      description: 'Реализованные проекты памятников и мемориальных комплексов.',
      url: '/portfolio',
    });
    this.seo.setJsonLd('portfolio', {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Портфолио',
      url: 'https://kavkazkamen.ru/portfolio',
    });
    this.api.getPortfolio().pipe(catchError(() => of(FALLBACK_PORTFOLIO))).subscribe({
      next: (data) => {
        this.items.set(data.length ? data : FALLBACK_PORTFOLIO);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
