import uuid
from pathlib import Path

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.files.storage import default_storage
from django.db.models import Q
from django.http import HttpResponse
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .manage_serializers import (
    ManageCategorySerializer,
    ManageConsultationSerializer,
    ManageExtraServiceSerializer,
    ManageLocationSerializer,
    ManagePortfolioSerializer,
    ManageProductSerializer,
    ManageReviewSerializer,
    ManageSitePageSerializer,
)
from .models import (
    Category,
    ConsultationRequest,
    ExtraService,
    OfficeLocation,
    PortfolioItem,
    Product,
    Review,
    SitePage,
)
from .permissions import IsStaffUser
from .yandex_price_list import export_xls_bytes, import_price_list


class ManageDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsStaffUser]

    def get(self, request):
        return Response({
            'products': Product.objects.count(),
            'categories': Category.objects.count(),
            'services': ExtraService.objects.count(),
            'pages': SitePage.objects.count(),
            'portfolio': PortfolioItem.objects.count(),
            'locations': OfficeLocation.objects.count(),
            'reviews': Review.objects.count(),
            'consultations': ConsultationRequest.objects.count(),
            'consultations_new': ConsultationRequest.objects.count(),
        })


class ManageImageUploadView(APIView):
    """Accept an image file from staff and return a public /media/ URL."""

    permission_classes = [IsAuthenticated, IsStaffUser]
    ALLOWED_TYPES = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp',
        'image/gif': '.gif',
    }

    def post(self, request):
        upload = request.FILES.get('file') or request.FILES.get('image')
        if not upload:
            return Response(
                {'detail': 'Выберите файл изображения'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        max_bytes = getattr(settings, 'MANAGE_UPLOAD_MAX_BYTES', 8 * 1024 * 1024)
        if upload.size > max_bytes:
            return Response(
                {'detail': f'Файл больше {max_bytes // (1024 * 1024)} МБ'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        content_type = (upload.content_type or '').lower()
        ext = self.ALLOWED_TYPES.get(content_type)
        if not ext:
            # fallback by filename
            suffix = Path(upload.name or '').suffix.lower()
            if suffix in {'.jpg', '.jpeg', '.png', '.webp', '.gif'}:
                ext = '.jpg' if suffix == '.jpeg' else suffix
            else:
                return Response(
                    {'detail': 'Допустимы JPEG, PNG, WebP или GIF'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        name = f'uploads/{uuid.uuid4().hex}{ext}'
        saved = default_storage.save(name, upload)
        url = f'{settings.MEDIA_URL}{saved}'.replace('//', '/')
        if not url.startswith('/'):
            url = f'/{url}'
        return Response({'url': url, 'name': upload.name})


class ManageProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsStaffUser]
    serializer_class = ManageProductSerializer
    queryset = Product.objects.select_related('category').prefetch_related(
        'images', 'extra_services'
    ).all()
    lookup_field = 'id'

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(sku__icontains=search))
        return qs

    @action(detail=False, methods=['get'], url_path='export-yandex')
    def export_yandex(self, request):
        """Скачать прайс-лист в формате шаблона Яндекс Бизнес (.xls)."""
        include_services = request.query_params.get('services', '1') != '0'
        content = export_xls_bytes(include_services=include_services)
        response = HttpResponse(content, content_type='application/vnd.ms-excel')
        response['Content-Disposition'] = 'attachment; filename="price-list-kavkazkamen.xls"'
        return response

    @action(detail=False, methods=['post'], url_path='import-yandex')
    def import_yandex(self, request):
        """Загрузить прайс-лист Яндекс Бизнес (.xls / .xlsx) и обновить каталог."""
        upload = request.FILES.get('file')
        if not upload:
            return Response(
                {'detail': 'Выберите файл прайс-листа (.xls или .xlsx)'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            result = import_price_list(upload)
        except ValidationError as exc:
            messages = getattr(exc, 'messages', None) or [str(exc)]
            return Response({'detail': messages[0]}, status=status.HTTP_400_BAD_REQUEST)
        return Response(result)


class ManageCategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsStaffUser]
    serializer_class = ManageCategorySerializer
    queryset = Category.objects.all()


class ManageExtraServiceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsStaffUser]
    serializer_class = ManageExtraServiceSerializer
    queryset = ExtraService.objects.all()


class ManageSitePageViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsStaffUser]
    serializer_class = ManageSitePageSerializer
    queryset = SitePage.objects.prefetch_related('blocks').all()
    lookup_field = 'slug'


class ManagePortfolioViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsStaffUser]
    serializer_class = ManagePortfolioSerializer
    queryset = PortfolioItem.objects.all()


class ManageLocationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsStaffUser]
    serializer_class = ManageLocationSerializer
    queryset = OfficeLocation.objects.all()


class ManageReviewViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsStaffUser]
    serializer_class = ManageReviewSerializer
    queryset = Review.objects.all()


class ManageConsultationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsStaffUser]
    serializer_class = ManageConsultationSerializer
    queryset = ConsultationRequest.objects.all()
    http_method_names = ['get', 'head', 'options', 'delete']
