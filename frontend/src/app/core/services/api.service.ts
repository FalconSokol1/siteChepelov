import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Category,
  OfficeLocation,
  PortfolioItem,
  Product,
  ProductFilters,
  Review,
  SitePage,
  SiteStats,
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories/`);
  }

  getProducts(filters: ProductFilters = {}): Observable<Product[]> {
    let params = new HttpParams();
    if (filters.material) params = params.set('material', filters.material);
    if (filters.style) params = params.set('style', filters.style);
    if (filters.type) params = params.set('type', filters.type);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.featured) params = params.set('featured', 'true');
    return this.http.get<Product[]>(`${this.baseUrl}/products/`, { params });
  }

  getProduct(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${slug}/`);
  }

  getReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/reviews/`);
  }

  getPortfolio(): Observable<PortfolioItem[]> {
    return this.http.get<PortfolioItem[]>(`${this.baseUrl}/portfolio/`);
  }

  getLocations(): Observable<OfficeLocation[]> {
    return this.http.get<OfficeLocation[]>(`${this.baseUrl}/locations/`);
  }

  getStats(): Observable<SiteStats> {
    return this.http.get<SiteStats>(`${this.baseUrl}/stats/`);
  }

  getPage(slug: string): Observable<SitePage> {
    return this.http.get<SitePage>(`${this.baseUrl}/pages/${slug}/`);
  }
}
