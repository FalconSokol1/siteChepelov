from django.db import transaction
from django.utils.text import slugify
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
from .serializers import ExtraServiceSerializer, ProductImageSerializer


class ManageCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ManageProductSerializer(serializers.ModelSerializer):
    category_title = serializers.CharField(source='category.title', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    extra_services = ExtraServiceSerializer(many=True, read_only=True)
    image_urls = serializers.ListField(
        child=serializers.URLField(max_length=1000),
        write_only=True,
        required=False,
    )
    extra_service_ids = serializers.PrimaryKeyRelatedField(
        queryset=ExtraService.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source='extra_services',
    )

    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'slug', 'name', 'material', 'style', 'product_type',
            'material_label', 'price', 'image_url', 'description', 'dimensions',
            'finish', 'featured', 'category', 'category_title', 'images',
            'extra_services', 'image_urls', 'extra_service_ids',
        ]

    def validate_sku(self, value):
        return value.strip()

    def validate_slug(self, value):
        return value.strip() or slugify(self.initial_data.get('name', ''), allow_unicode=False)

    @transaction.atomic
    def create(self, validated_data):
        image_urls = validated_data.pop('image_urls', [])
        extra_services = validated_data.pop('extra_services', [])
        if not validated_data.get('image_url') and image_urls:
            validated_data['image_url'] = image_urls[0]
        product = Product.objects.create(**validated_data)
        if extra_services:
            product.extra_services.set(extra_services)
        self._sync_images(product, image_urls)
        return product

    @transaction.atomic
    def update(self, instance, validated_data):
        image_urls = validated_data.pop('image_urls', None)
        extra_services = validated_data.pop('extra_services', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if not instance.image_url and image_urls:
            instance.image_url = image_urls[0]
        instance.save()
        if extra_services is not None:
            instance.extra_services.set(extra_services)
        if image_urls is not None:
            self._sync_images(instance, image_urls)
        return instance

    def _sync_images(self, product, image_urls):
        product.images.all().delete()
        ProductImage.objects.bulk_create([
            ProductImage(
                product=product,
                image_url=url,
                alt_text=product.name,
                sort_order=index,
            )
            for index, url in enumerate(image_urls)
        ])


class ManageExtraServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExtraService
        fields = '__all__'


class ManageContentBlockSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = ContentBlock
        fields = [
            'id', 'key', 'title', 'body', 'image_url', 'button_label',
            'button_url', 'extra_data', 'is_enabled', 'sort_order', 'updated_at',
        ]
        read_only_fields = ['updated_at']
        extra_kwargs = {
            'key': {'required': False},
            'title': {'required': False},
            'body': {'required': False},
            'image_url': {'required': False, 'allow_blank': True},
            'button_label': {'required': False, 'allow_blank': True},
            'button_url': {'required': False, 'allow_blank': True},
            'extra_data': {'required': False},
            'is_enabled': {'required': False},
            'sort_order': {'required': False},
        }


class ManageSitePageSerializer(serializers.ModelSerializer):
    blocks = ManageContentBlockSerializer(many=True, required=False)

    class Meta:
        model = SitePage
        fields = [
            'id', 'slug', 'title', 'meta_title', 'meta_description',
            'is_published', 'updated_at', 'blocks',
        ]
        read_only_fields = ['updated_at']

    @transaction.atomic
    def create(self, validated_data):
        blocks_data = validated_data.pop('blocks', [])
        page = SitePage.objects.create(**validated_data)
        for index, block in enumerate(blocks_data):
            block.pop('id', None)
            ContentBlock.objects.create(
                page=page,
                sort_order=block.pop('sort_order', index),
                **block,
            )
        return page

    @transaction.atomic
    def update(self, instance, validated_data):
        blocks_data = validated_data.pop('blocks', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if blocks_data is not None:
            keep_ids = []
            for index, block in enumerate(blocks_data):
                block_id = block.get('id')
                defaults = {
                    'title': block.get('title', ''),
                    'body': block.get('body', ''),
                    'image_url': block.get('image_url', ''),
                    'button_label': block.get('button_label', ''),
                    'button_url': block.get('button_url', ''),
                    'extra_data': block.get('extra_data') or {},
                    'is_enabled': block.get('is_enabled', True),
                    'sort_order': block.get('sort_order', index),
                }
                if block_id:
                    obj = ContentBlock.objects.filter(page=instance, id=block_id).first()
                    if obj:
                        for key, value in defaults.items():
                            setattr(obj, key, value)
                        if block.get('key'):
                            obj.key = block['key']
                        obj.save()
                        keep_ids.append(obj.id)
                        continue
                key = block.get('key') or f'block-{index + 1}'
                obj, _ = ContentBlock.objects.update_or_create(
                    page=instance,
                    key=key,
                    defaults=defaults,
                )
                keep_ids.append(obj.id)
            instance.blocks.exclude(id__in=keep_ids).delete()
        return instance


class ManagePortfolioSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioItem
        fields = '__all__'


class ManageLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfficeLocation
        fields = '__all__'


class ManageReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['created_at']


class ManageConsultationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultationRequest
        fields = '__all__'
        read_only_fields = ['created_at']
