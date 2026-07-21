import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMPANY } from '../../core/data/company';
import { LEGAL_LINKS } from '../../core/data/legal-documents';
import { CmsContentService } from '../../core/services/cms-content.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly cms = inject(CmsContentService);
  readonly year = new Date().getFullYear();
  readonly company = COMPANY;
  readonly legalLinks = LEGAL_LINKS;

  constructor() {
    this.cms.load('global').subscribe();
  }
}
