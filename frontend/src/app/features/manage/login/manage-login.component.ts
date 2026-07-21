import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-manage-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './manage-login.component.html',
  styleUrl: './manage-login.component.scss',
})
export class ManageLoginComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);

  username = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor() {
    if (this.route.snapshot.queryParamMap.get('error') === 'staff') {
      this.error.set('Нужен аккаунт администратора сайта');
    }
  }

  ngOnInit(): void {
    this.seo.setNoIndex();
  }

  submit(): void {
    this.error.set('');
    this.loading.set(true);
    this.auth.login({ username: this.username.trim(), password: this.password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (!res.user.is_staff) {
          this.auth.forceLogout();
          this.error.set('Этот пользователь не является администратором');
          return;
        }
        void this.router.navigateByUrl('/manage');
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Неверный логин или пароль');
      },
    });
  }
}
