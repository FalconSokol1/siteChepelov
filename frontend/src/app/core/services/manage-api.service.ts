import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import {
  Category,
  ConsultationRequest,
  ContentBlock,
  ExtraService,
  OfficeLocation,
  PortfolioItem,
  Product,
  Review,
  SitePage,
} from '../models';

export interface ManageDashboardStats {
  products: number;
  categories: number;
  services: number;
  pages: number;
  portfolio: number;
  locations: number;
  reviews: number;
  consultations: number;
}

export interface ManageProductPayload {
  sku: string;
  slug: string;
  name: string;
  material: string;
  style: string;
  product_type: string;
  material_label: string;
  price: number;
  image_url: string;
  description?: string;
  dimensions?: string;
  finish?: string;
  featured?: boolean;
  category?: number | null;
  image_urls?: string[];
  extra_service_ids?: number[];
}

@Injectable({ providedIn: 'root' })
export class ManageApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly base = `${environment.apiUrl}/manage`;

  private opts() {
    return { headers: this.auth.authHeaders() };
  }

  dashboard(): Observable<ManageDashboardStats> {
    return this.http.get<ManageDashboardStats>(`${this.base}/dashboard/`, this.opts());
  }

  uploadImage(file: File): Observable<{ url: string; name: string }> {
    const body = new FormData();
    body.append('file', file, file.name);
    return this.http.post<{ url: string; name: string }>(
      `${this.base}/upload/`,
      body,
      this.opts()
    );
  }

  products(search = ''): Observable<Product[]> {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.http.get<Product[]>(`${this.base}/products/${q}`, this.opts());
  }

  product(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/products/${id}/`, this.opts());
  }

  createProduct(data: ManageProductPayload): Observable<Product> {
    return this.http.post<Product>(`${this.base}/products/`, data, this.opts());
  }

  updateProduct(id: number, data: Partial<ManageProductPayload>): Observable<Product> {
    return this.http.patch<Product>(`${this.base}/products/${id}/`, data, this.opts());
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/products/${id}/`, this.opts());
  }

  exportYandexPriceList(): Observable<Blob> {
    return this.http.get(`${this.base}/products/export-yandex/`, {
      ...this.opts(),
      responseType: 'blob',
    });
  }

  importYandexPriceList(file: File): Observable<{
    created_products: number;
    updated_products: number;
    created_services: number;
    updated_services: number;
    errors: string[];
    total_rows: number;
  }> {
    const body = new FormData();
    body.append('file', file, file.name);
    return this.http.post<{
      created_products: number;
      updated_products: number;
      created_services: number;
      updated_services: number;
      errors: string[];
      total_rows: number;
    }>(`${this.base}/products/import-yandex/`, body, this.opts());
  }

  categories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/categories/`, this.opts());
  }

  createCategory(data: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.base}/categories/`, data, this.opts());
  }

  updateCategory(id: number, data: Partial<Category>): Observable<Category> {
    return this.http.patch<Category>(`${this.base}/categories/${id}/`, data, this.opts());
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/categories/${id}/`, this.opts());
  }

  services(): Observable<ExtraService[]> {
    return this.http.get<ExtraService[]>(`${this.base}/services/`, this.opts());
  }

  createService(data: Partial<ExtraService>): Observable<ExtraService> {
    return this.http.post<ExtraService>(`${this.base}/services/`, data, this.opts());
  }

  updateService(id: number, data: Partial<ExtraService>): Observable<ExtraService> {
    return this.http.patch<ExtraService>(`${this.base}/services/${id}/`, data, this.opts());
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/services/${id}/`, this.opts());
  }

  pages(): Observable<SitePage[]> {
    return this.http.get<SitePage[]>(`${this.base}/pages/`, this.opts());
  }

  page(slug: string): Observable<SitePage> {
    return this.http.get<SitePage>(`${this.base}/pages/${slug}/`, this.opts());
  }

  createPage(data: Partial<SitePage> & { blocks?: ContentBlock[] }): Observable<SitePage> {
    return this.http.post<SitePage>(`${this.base}/pages/`, data, this.opts());
  }

  updatePage(slug: string, data: Partial<SitePage> & { blocks?: ContentBlock[] }): Observable<SitePage> {
    return this.http.patch<SitePage>(`${this.base}/pages/${slug}/`, data, this.opts());
  }

  portfolio(): Observable<PortfolioItem[]> {
    return this.http.get<PortfolioItem[]>(`${this.base}/portfolio/`, this.opts());
  }

  createPortfolio(data: Partial<PortfolioItem>): Observable<PortfolioItem> {
    return this.http.post<PortfolioItem>(`${this.base}/portfolio/`, data, this.opts());
  }

  updatePortfolio(id: number, data: Partial<PortfolioItem>): Observable<PortfolioItem> {
    return this.http.patch<PortfolioItem>(`${this.base}/portfolio/${id}/`, data, this.opts());
  }

  deletePortfolio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/portfolio/${id}/`, this.opts());
  }

  locations(): Observable<OfficeLocation[]> {
    return this.http.get<OfficeLocation[]>(`${this.base}/locations/`, this.opts());
  }

  updateLocation(id: number, data: Partial<OfficeLocation>): Observable<OfficeLocation> {
    return this.http.patch<OfficeLocation>(`${this.base}/locations/${id}/`, data, this.opts());
  }

  reviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.base}/reviews/`, this.opts());
  }

  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/reviews/${id}/`, this.opts());
  }

  consultations(): Observable<ConsultationRequest[]> {
    return this.http.get<ConsultationRequest[]>(`${this.base}/consultations/`, this.opts());
  }

  deleteConsultation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/consultations/${id}/`, this.opts());
  }
}
