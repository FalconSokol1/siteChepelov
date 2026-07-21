import re

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import (
    Category,
    ConsultationRequest,
    ContentBlock,
    ExtraService,
    OfficeLocation,
    PortfolioItem,
    Product,
    ProductImage,
    Review,
    SitePage,
)
from .validators import strip_control_chars, validate_phone, validate_username

User = get_user_model()
EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'alt_text', 'sort_order']


class ExtraServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExtraService
        fields = ['id', 'slug', 'title', 'description', 'price', 'sort_order']


class ProductSerializer(serializers.ModelSerializer):
    category_title = serializers.CharField(source='category.title', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    extra_services = ExtraServiceSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'slug', 'name', 'material', 'style', 'product_type',
            'material_label', 'price', 'image_url', 'description', 'dimensions',
            'finish', 'featured', 'category', 'category_title', 'images',
            'extra_services',
        ]


class ContentBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentBlock
        fields = [
            'key', 'title', 'body', 'image_url', 'button_label', 'button_url',
            'extra_data', 'sort_order',
        ]


class SitePageSerializer(serializers.ModelSerializer):
    blocks = serializers.SerializerMethodField()

    class Meta:
        model = SitePage
        fields = ['slug', 'title', 'meta_title', 'meta_description', 'blocks', 'updated_at']

    def get_blocks(self, obj):
        blocks = obj.blocks.filter(is_enabled=True)
        return ContentBlockSerializer(blocks, many=True).data


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = [
            'id', 'author', 'text', 'rating', 'image_url', 'is_video',
            'sort_order', 'created_at',
        ]


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['text', 'rating', 'image_url']

    def validate_text(self, value):
        cleaned = strip_control_chars(value)
        if len(cleaned) < 10:
            raise serializers.ValidationError('Отзыв слишком короткий (минимум 10 символов)')
        if len(cleaned) > 2000:
            raise serializers.ValidationError('Отзыв слишком длинный (максимум 2000 символов)')
        return cleaned

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError('Оценка от 1 до 5')
        return value

    def validate_image_url(self, value):
        if not value:
            return ''
        value = value.strip()
        allowed_prefixes = (
            'data:image/jpeg',
            'data:image/png',
            'data:image/webp',
            'data:image/gif',
            'http://',
            'https://',
        )
        if not value.startswith(allowed_prefixes):
            raise serializers.ValidationError('Недопустимый формат изображения')
        # ~7 МБ на base64 (примерно 5 МБ исходного файла)
        if len(value) > 7_500_000:
            raise serializers.ValidationError('Файл слишком большой (максимум 5 МБ)')
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        author = user.get_full_name().strip() or user.first_name or user.username
        return Review.objects.create(user=user, author=author, **validated_data)


class PortfolioItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioItem
        fields = '__all__'


class OfficeLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfficeLocation
        fields = [
            'id', 'city', 'slug', 'address', 'phone', 'latitude', 'longitude',
            'is_headquarters', 'is_highlighted', 'region', 'projects_count', 'description',
        ]


class ConsultationRequestSerializer(serializers.ModelSerializer):
    website = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = ConsultationRequest
        fields = [
            'id', 'name', 'phone', 'monument_type', 'material', 'message',
            'website', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def validate(self, attrs):
        if attrs.pop('website', '').strip():
            raise serializers.ValidationError('Отправка отклонена')
        return attrs

    def validate_name(self, value):
        cleaned = strip_control_chars(value)
        if len(cleaned) < 2:
            raise serializers.ValidationError('Укажите имя')
        if len(cleaned) > 120:
            raise serializers.ValidationError('Имя слишком длинное')
        return cleaned

    def validate_phone(self, value):
        return validate_phone(value)

    def validate_message(self, value):
        if not value:
            return ''
        cleaned = strip_control_chars(value)
        if len(cleaned) > 2000:
            raise serializers.ValidationError('Сообщение слишком длинное')
        return cleaned

    def validate_monument_type(self, value):
        if not value:
            return ''
        return strip_control_chars(value)[:80]

    def validate_material(self, value):
        if not value:
            return ''
        return strip_control_chars(value)[:80]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, max_length=128)
    password_confirm = serializers.CharField(write_only=True, max_length=128)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password_confirm']

    def validate_username(self, value):
        return validate_username(value)

    def validate_email(self, value):
        cleaned = value.strip().lower()
        if not EMAIL_RE.match(cleaned):
            raise serializers.ValidationError('Некорректный email')
        if len(cleaned) > 254:
            raise serializers.ValidationError('Email слишком длинный')
        return cleaned

    def validate_first_name(self, value):
        return strip_control_chars(value)[:150]

    def validate_last_name(self, value):
        return strip_control_chars(value)[:150]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Пароли не совпадают'})
        validate_password(attrs['password'])
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        return User.objects.create_user(password=password, **validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_staff', 'is_superuser',
        ]
