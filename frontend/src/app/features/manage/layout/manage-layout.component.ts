import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-manage-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './manage-layout.component.html',
  styleUrl: './manage-layout.component.scss',
})
export class ManageLayoutComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  readonly nav = [
    { path: '/manage', label: 'Консоль', exact: true, icon: 'dashboard' },
    { path: '/manage/products', label: 'Товары', exact: false, icon: 'inventory_2' },
    { path: '/manage/categories', label: 'Категории', exact: false, icon: 'category' },
    { path: '/manage/services', label: 'Услуги', exact: false, icon: 'handyman' },
    { path: '/manage/pages', label: 'Страницы', exact: false, icon: 'article' },
    { path: '/manage/portfolio', label: 'Портфолио', exact: false, icon: 'photo_library' },
    { path: '/manage/locations', label: 'Адреса', exact: false, icon: 'location_on' },
    { path: '/manage/reviews', label: 'Отзывы', exact: false, icon: 'reviews' },
    { path: '/manage/consultations', label: 'Обращения', exact: false, icon: 'mail' },
  ];

  ngOnInit(): void {
    this.seo.setNoIndex();
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => void this.router.navigateByUrl('/manage/login'),
      error: () => void this.router.navigateByUrl('/manage/login'),
    });
  }
}
