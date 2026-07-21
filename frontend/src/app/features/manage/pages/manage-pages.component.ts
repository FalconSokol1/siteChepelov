import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SitePage } from '../../../core/models';
import { ManageApiService } from '../../../core/services/manage-api.service';

const PAGE_HINTS: Record<string, string> = {
  global: 'Шапка, подвал, телефон, адрес — общие тексты всего сайта',
  home: 'Главная: герой, категории, СВО, о компании и другие секции',
  catalog: 'Тексты страницы каталога',
  product: 'Подписи на карточке товара',
  map: 'Страница «Карта / адреса»',
  portfolio: 'Страница портфолио (работы сами — в разделе Портфолио)',
  reviews: 'Страница отзывов',
  'legal-privacy': 'Политика конфиденциальности',
  'legal-offer': 'Публичная оферта',
  'legal-requisites': 'Реквизиты ИП',
};

@Component({
  selector: 'app-manage-pages',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './manage-pages.component.html',
  styleUrl: './manage-pages.component.scss',
})
export class ManagePagesComponent implements OnInit {
  private readonly api = inject(ManageApiService);
  readonly items = signal<SitePage[]>([]);
  readonly error = signal('');

  ngOnInit(): void {
    this.api.pages().subscribe({
      next: (list) => this.items.set(list),
      error: () => this.error.set('Не удалось загрузить страницы'),
    });
  }

  hint(page: SitePage): string {
    return PAGE_HINTS[page.slug] || 'Тексты и картинки этой страницы';
  }
}
