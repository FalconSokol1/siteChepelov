from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from api.seo_views import RobotsTxtView, SitemapXmlView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('robots.txt', RobotsTxtView.as_view(), name='robots-txt'),
    path('sitemap.xml', SitemapXmlView.as_view(), name='sitemap-xml'),
    path('api/', include('api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
