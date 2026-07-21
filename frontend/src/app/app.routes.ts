import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { CatalogComponent } from './features/catalog/catalog.component';
import { MapComponent } from './features/map/map.component';
import { ReviewsComponent } from './features/reviews/reviews.component';
import { PortfolioComponent } from './features/portfolio/portfolio.component';
import { LegalPageComponent } from './features/legal/legal-page.component';
import { ProductDetailComponent } from './features/product/product-detail.component';

export const routes: Routes = [
  {
    path: 'manage',
    loadChildren: () =>
      import('./features/manage/manage.routes').then((m) => m.MANAGE_ROUTES),
  },
  { path: '', component: HomeComponent },
  { path: 'catalog/:slug', component: ProductDetailComponent },
  { path: 'catalog', component: CatalogComponent },
  { path: 'cart', redirectTo: 'catalog' },
  { path: 'map', component: MapComponent },
  { path: 'reviews', component: ReviewsComponent },
  { path: 'portfolio', component: PortfolioComponent },
  { path: 'legal/:slug', component: LegalPageComponent },
  { path: '**', redirectTo: '' },
];
