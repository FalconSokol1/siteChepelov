import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models';
import { CmsContentService } from '../../core/services/cms-content.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  readonly cms = inject(CmsContentService);
  readonly product = input.required<Product>();
  readonly compact = input(false);

  constructor() {
    this.cms.load('global').subscribe();
  }

  formatPrice(price: number): string {
    return price.toLocaleString('ru-RU') + ' ₽';
  }
}
