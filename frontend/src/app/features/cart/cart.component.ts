import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMPANY } from '../../core/data/company';
import { CartService } from '../../core/services/cart.service';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, HeaderComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  readonly cart = inject(CartService);
  readonly company = COMPANY;
  readonly orderDialogOpen = signal(false);

  formatPrice(price: number): string {
    return price.toLocaleString('ru-RU') + ' ₽';
  }

  openOrderDialog(): void {
    this.orderDialogOpen.set(true);
  }

  closeOrderDialog(): void {
    this.orderDialogOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.orderDialogOpen()) {
      this.closeOrderDialog();
    }
  }
}
