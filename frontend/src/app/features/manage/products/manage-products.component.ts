import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models';
import { ManageApiService } from '../../../core/services/manage-api.service';

@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [FormsModule, RouterLink, DecimalPipe],
  templateUrl: './manage-products.component.html',
  styleUrl: './manage-products.component.scss',
})
export class ManageProductsComponent implements OnInit {
  private readonly api = inject(ManageApiService);

  readonly items = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly notice = signal('');
  readonly busy = signal(false);
  search = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.products(this.search.trim()).subscribe({
      next: (list) => {
        this.items.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Не удалось загрузить товары');
        this.loading.set(false);
      },
    });
  }

  remove(item: Product): void {
    if (!confirm(`Удалить «${item.name}»?`)) return;
    this.api.deleteProduct(item.id).subscribe({
      next: () => this.items.update((list) => list.filter((p) => p.id !== item.id)),
      error: () => alert('Не удалось удалить'),
    });
  }

  exportYandex(): void {
    this.notice.set('');
    this.error.set('');
    this.busy.set(true);
    this.api.exportYandexPriceList().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'price-list-kavkazkamen.xls';
        a.click();
        URL.revokeObjectURL(url);
        this.busy.set(false);
        this.notice.set('Прайс-лист скачан');
      },
      error: () => {
        this.busy.set(false);
        this.error.set('Не удалось скачать прайс-лист');
      },
    });
  }

  onImportFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.notice.set('');
    this.error.set('');
    this.busy.set(true);
    this.api.importYandexPriceList(file).subscribe({
      next: (result) => {
        this.busy.set(false);
        const parts = [
          `товаров: +${result.created_products} / ~${result.updated_products}`,
          `услуг: +${result.created_services} / ~${result.updated_services}`,
        ];
        let message = `Импорт завершён (${result.total_rows} строк). ${parts.join(', ')}.`;
        if (result.errors?.length) {
          message += ` Предупреждения: ${result.errors.slice(0, 3).join('; ')}`;
        }
        this.notice.set(message);
        this.load();
      },
      error: (err) => {
        this.busy.set(false);
        const detail = err?.error?.detail;
        this.error.set(typeof detail === 'string' ? detail : 'Не удалось импортировать прайс-лист');
      },
    });
  }
}
