import logging

from django.contrib.auth import authenticate
from django.db.models import Q
from rest_framework import generics, status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Category,
    ExtraService,
    OfficeLocation,
    PortfolioItem,
    Product,
    Review,
    SitePage,
)
from .serializers import (
    CategorySerializer,
    ExtraServiceSerializer,
    OfficeLocationSerializer,
    PortfolioItemSerializer,
    ProductSerializer,
    ReviewSerializer,
    SitePageSerializer,
    UserSerializer,
)
from .throttling import AuthRateThrottle

logger = logging.getLogger('api.security')

VALID_MATERIALS = {choice[0] for choice in Product.MATERIAL_CHOICES}
VALID_STYLES = {choice[0] for choice in Product.STYLE_CHOICES}
VALID_TYPES = {choice[0] for choice in Product.TYPE_CHOICES}
MAX_SEARCH_LENGTH = 100


def _issue_token(user):
    Token.objects.filter(user=user).delete()
    return Token.objects.create(user=user)


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Product.objects.select_related('category').prefetch_related(
            'images',
            'extra_services',
        )
        material = self.request.query_params.get('material', '').strip()
        style = self.request.query_params.get('style', '').strip()
        product_type = self.request.query_params.get('type', '').strip()
        search = self.request.query_params.get('search', '').strip()
        featured = self.request.query_params.get('featured')

        if material in VALID_MATERIALS:
            queryset = queryset.filter(material=material)
        if style in VALID_STYLES:
            queryset = queryset.filter(style=style)
        if product_type in VALID_TYPES:
            queryset = queryset.filter(product_type=product_type)
        if featured in ('1', 'true', 'True'):
            queryset = queryset.filter(featured=True)
        if search:
            search = search[:MAX_SEARCH_LENGTH]
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(material_label__icontains=search)
                | Q(description__icontains=search)
            )
        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.select_related('category').prefetch_related(
        'images',
        'extra_services',
    )
    serializer_class = ProductSerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]


class ExtraServiceListView(generics.ListAPIView):
    queryset = ExtraService.objects.filter(is_active=True)
    serializer_class = ExtraServiceSerializer
    permission_classes = [AllowAny]


class SitePageDetailView(generics.RetrieveAPIView):
    queryset = SitePage.objects.filter(is_published=True).prefetch_related('blocks')
    serializer_class = SitePageSerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]


class ReviewListView(generics.ListAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]


class ReviewCreateView(APIView):
    """Публичное создание отзывов отключено — только через админку."""

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        return Response(
            {'detail': 'Публичная отправка отзывов отключена. Обратитесь по телефону или email.'},
            status=status.HTTP_410_GONE,
        )


class PortfolioListView(generics.ListAPIView):
    queryset = PortfolioItem.objects.all()
    serializer_class = PortfolioItemSerializer
    permission_classes = [AllowAny]


class OfficeLocationListView(generics.ListAPIView):
    queryset = OfficeLocation.objects.all()
    serializer_class = OfficeLocationSerializer
    permission_classes = [AllowAny]


class ConsultationCreateView(APIView):
    """Публичные заявки отключены — контакт по телефону / email / в офисе."""

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        return Response(
            {'detail': 'Форма заявок отключена. Свяжитесь с нами по телефону или email.'},
            status=status.HTTP_410_GONE,
        )


class RegisterView(APIView):
    """Публичная регистрация отключена."""

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        return Response(
            {'detail': 'Регистрация на сайте отключена.'},
            status=status.HTTP_410_GONE,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]
    authentication_classes = []

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')
        if not username or not password:
            return Response(
                {'detail': 'Неверный логин или пароль'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        user = authenticate(username=username, password=password)
        if not user:
            logger.warning('Failed login attempt for username=%s ip=%s', username, _client_ip(request))
            return Response(
                {'detail': 'Неверный логин или пароль'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if not user.is_staff:
            logger.warning('Non-staff login blocked username=%s ip=%s', username, _client_ip(request))
            return Response(
                {'detail': 'Доступ только для сотрудников'},
                status=status.HTTP_403_FORBIDDEN,
            )
        token = _issue_token(user)
        return Response({'token': token.key, 'user': UserSerializer(user).data})


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response({'detail': 'Вы вышли из аккаунта'})


class HealthView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = []

    def get(self, request):
        from django.conf import settings

        try:
            Product.objects.exists()
            db_ok = True
        except Exception:
            db_ok = False
        payload = {'status': 'ok' if db_ok else 'degraded'}
        if settings.DEBUG:
            payload['database'] = 'ok' if db_ok else 'error'
        return Response(
            payload,
            status=status.HTTP_200_OK if db_ok else status.HTTP_503_SERVICE_UNAVAILABLE,
        )


class SiteStatsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {
                'years_experience': 25,
                'completed_projects': 5000,
                'catalog_count': Product.objects.count(),
                'cities_count': OfficeLocation.objects.count(),
            }
        )


def _client_ip(request):
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')
