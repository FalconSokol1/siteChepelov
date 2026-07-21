import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ManageApiService,
  ManageDashboardStats,
} from '../../../core/services/manage-api.service';

@Component({
  selector: 'app-manage-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './manage-dashboard.component.html',
  styleUrl: './manage-dashboard.component.scss',
})
export class ManageDashboardComponent implements OnInit {
  private readonly api = inject(ManageApiService);
  readonly stats = signal<ManageDashboardStats | null>(null);
  readonly error = signal('');

  readonly cards = [
    { key: 'products' as const, label: 'Товары', link: '/manage/products', color: '#2271b1' },
    { key: 'services' as const, label: 'Услуги', link: '/manage/services', color: '#00a32a' },
    { key: 'pages' as const, label: 'Страницы', link: '/manage/pages', color: '#dba617' },
    { key: 'portfolio' as const, label: 'Портфолио', link: '/manage/portfolio', color: '#9b51e0' },
    { key: 'locations' as const, label: 'Адреса', link: '/manage/locations', color: '#d63638' },
    {
      key: 'consultations' as const,
      label: 'Заявки',
      link: '/manage/consultations',
      color: '#1d2327',
    },
  ];

  ngOnInit(): void {
    this.api.dashboard().subscribe({
      next: (s) => this.stats.set(s),
      error: () => this.error.set('Не удалось загрузить статистику'),
    });
  }
}
