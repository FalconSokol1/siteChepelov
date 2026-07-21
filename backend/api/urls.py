from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import manage_views, views

manage_router = DefaultRouter()
manage_router.register('products', manage_views.ManageProductViewSet, basename='manage-products')
manage_router.register('categories', manage_views.ManageCategoryViewSet, basename='manage-categories')
manage_router.register('services', manage_views.ManageExtraServiceViewSet, basename='manage-services')
manage_router.register('pages', manage_views.ManageSitePageViewSet, basename='manage-pages')
manage_router.register('portfolio', manage_views.ManagePortfolioViewSet, basename='manage-portfolio')
manage_router.register('locations', manage_views.ManageLocationViewSet, basename='manage-locations')
manage_router.register('reviews', manage_views.ManageReviewViewSet, basename='manage-reviews')
manage_router.register(
    'consultations',
    manage_views.ManageConsultationViewSet,
    basename='manage-consultations',
)

urlpatterns = [
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('products/', views.ProductListView.as_view(), name='product-list'),
    path('products/<slug:slug>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('extra-services/', views.ExtraServiceListView.as_view(), name='extra-service-list'),
    path('pages/<slug:slug>/', views.SitePageDetailView.as_view(), name='site-page-detail'),
    path('reviews/', views.ReviewListView.as_view(), name='review-list'),
    path('reviews/create/', views.ReviewCreateView.as_view(), name='review-create'),
    path('portfolio/', views.PortfolioListView.as_view(), name='portfolio-list'),
    path('locations/', views.OfficeLocationListView.as_view(), name='location-list'),
    path('consultations/', views.ConsultationCreateView.as_view(), name='consultation-create'),
    path('auth/register/', views.RegisterView.as_view(), name='auth-register'),
    path('auth/login/', views.LoginView.as_view(), name='auth-login'),
    path('auth/logout/', views.LogoutView.as_view(), name='auth-logout'),
    path('auth/me/', views.MeView.as_view(), name='auth-me'),
    path('health/', views.HealthView.as_view(), name='health'),
    path('stats/', views.SiteStatsView.as_view(), name='site-stats'),
    path('manage/dashboard/', manage_views.ManageDashboardView.as_view(), name='manage-dashboard'),
    path('manage/upload/', manage_views.ManageImageUploadView.as_view(), name='manage-upload'),
    path('manage/', include(manage_router.urls)),
]
