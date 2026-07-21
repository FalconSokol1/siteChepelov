import { Component, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CmsContentService } from '../../core/services/cms-content.service';

@Component({
  selector: 'app-consent-checkboxes',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './consent-checkboxes.component.html',
  styleUrl: './consent-checkboxes.component.scss',
})
export class ConsentCheckboxesComponent {
  readonly cms = inject(CmsContentService);
  pdConsent = model(false);
  marketingConsent = model(false);
  showMarketing = input(true);
  compact = input(false);

  constructor() {
    this.cms.load('global').subscribe();
  }
}
