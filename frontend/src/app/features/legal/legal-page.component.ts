import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { getLegalDocument, LegalDocument } from '../../core/data/legal-documents';
import { ContentBlock, SitePage } from '../../core/models';
import { CmsContentService } from '../../core/services/cms-content.service';
import { SeoService } from '../../core/services/seo.service';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './legal-page.component.html',
  styleUrl: './legal-page.component.scss',
})
export class LegalPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly cms = inject(CmsContentService);
  private readonly seo = inject(SeoService);
  readonly page = signal<SitePage | null>(null);
  readonly fallback = signal<LegalDocument | undefined>(undefined);
  readonly loading = signal(true);

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug') ?? '';
      this.loading.set(true);
      this.page.set(null);
      this.fallback.set(getLegalDocument(slug));
      this.cms.load(`legal-${slug}`).subscribe((page) => {
        this.page.set(page);
        if (page) {
          this.cms.applyPageSeo(page, { url: `/legal/${slug}` });
        } else {
          const doc = this.fallback();
          if (doc) {
            this.seo.update({
              title: `${doc.title} — КавказКамень`,
              description: doc.lead,
              url: `/legal/${slug}`,
            });
          }
        }
        this.loading.set(false);
      });
    });
  }

  intro(page: SitePage): ContentBlock | undefined {
    return page.blocks.find((block) => block.key === 'intro');
  }

  sections(page: SitePage): ContentBlock[] {
    return page.blocks.filter((block) => block.key !== 'intro');
  }

  paragraphs(body: string): string[] {
    return this.cms.paragraphs(body);
  }
}
