import { Routes } from '@angular/router';
import { guestStaffGuard, staffGuard } from '../../core/guards/staff.guard';

export const MANAGE_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [guestStaffGuard],
    loadComponent: () =>
      import('./login/manage-login.component').then((m) => m.ManageLoginComponent),
  },
  {
    path: '',
    canActivate: [staffGuard],
    loadComponent: () =>
      import('./layout/manage-layout.component').then((m) => m.ManageLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./dashboard/manage-dashboard.component').then((m) => m.ManageDashboardComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./products/manage-products.component').then((m) => m.ManageProductsComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./categories/manage-categories.component').then(
            (m) => m.ManageCategoriesComponent
          ),
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./products/manage-product-edit.component').then(
            (m) => m.ManageProductEditComponent
          ),
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('./products/manage-product-edit.component').then(
            (m) => m.ManageProductEditComponent
          ),
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./services/manage-services.component').then((m) => m.ManageServicesComponent),
      },
      {
        path: 'pages',
        loadComponent: () =>
          import('./pages/manage-pages.component').then((m) => m.ManagePagesComponent),
      },
      {
        path: 'pages/:slug',
        loadComponent: () =>
          import('./pages/manage-page-edit.component').then((m) => m.ManagePageEditComponent),
      },
      {
        path: 'portfolio',
        loadComponent: () =>
          import('./portfolio/manage-portfolio.component').then(
            (m) => m.ManagePortfolioComponent
          ),
      },
      {
        path: 'locations',
        loadComponent: () =>
          import('./locations/manage-locations.component').then(
            (m) => m.ManageLocationsComponent
          ),
      },
      {
        path: 'consultations',
        loadComponent: () =>
          import('./consultations/manage-consultations.component').then(
            (m) => m.ManageConsultationsComponent
          ),
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('./reviews/manage-reviews.component').then((m) => m.ManageReviewsComponent),
      },
    ],
  },
];
