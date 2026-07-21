import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUser, LoginRequest, RegisterRequest } from '../models';

const TOKEN_KEY = 'kk_auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  private readonly storage = typeof sessionStorage !== 'undefined' ? sessionStorage : localStorage;

  readonly user = signal<AuthUser | null>(null);
  readonly token = signal<string | null>(this.storage.getItem(TOKEN_KEY));

  constructor() {
    if (this.token()) {
      this.loadMe().subscribe({ error: () => this.clearSession() });
    }
  }

  get isLoggedIn(): boolean {
    return !!this.token();
  }

  authHeaders(): HttpHeaders {
    const t = this.token();
    return t ? new HttpHeaders({ Authorization: `Token ${t}` }) : new HttpHeaders();
  }

  register(data: RegisterRequest): Observable<{ token: string; user: AuthUser }> {
    return this.http.post<{ token: string; user: AuthUser }>(`${this.baseUrl}/auth/register/`, data).pipe(
      tap((res) => this.setSession(res.token, res.user))
    );
  }

  login(data: LoginRequest): Observable<{ token: string; user: AuthUser }> {
    return this.http.post<{ token: string; user: AuthUser }>(`${this.baseUrl}/auth/login/`, data).pipe(
      tap((res) => this.setSession(res.token, res.user))
    );
  }

  logout(): Observable<{ detail: string }> {
    return this.http.post<{ detail: string }>(`${this.baseUrl}/auth/logout/`, {}, { headers: this.authHeaders() }).pipe(
      tap(() => this.clearSession())
    );
  }

  /** Drop local session without calling the API (e.g. non-staff user). */
  forceLogout(): void {
    this.clearSession();
  }

  loadMe(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.baseUrl}/auth/me/`, { headers: this.authHeaders() }).pipe(
      tap((user) => this.user.set(user))
    );
  }

  private setSession(token: string, user: AuthUser): void {
    this.storage.setItem(TOKEN_KEY, token);
    this.token.set(token);
    this.user.set(user);
  }

  private clearSession(): void {
    this.storage.removeItem(TOKEN_KEY);
    this.token.set(null);
    this.user.set(null);
  }
}
