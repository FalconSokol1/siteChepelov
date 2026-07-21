from django.http import HttpResponse
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from .seo import robots_txt, sitemap_xml


class RobotsTxtView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return HttpResponse(
            robots_txt(),
            content_type='text/plain; charset=utf-8',
        )


class SitemapXmlView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return HttpResponse(
            sitemap_xml(),
            content_type='application/xml; charset=utf-8',
        )
