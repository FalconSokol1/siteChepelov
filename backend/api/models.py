from django.conf import settings
from django.db import models
from django.utils import timezone


class Category(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=200, blank=True)
    image_url = models.URLField(max_length=1000)
    price_from = models.CharField(max_length=100, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'title']
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.title


class Product(models.Model):
    MATERIAL_CHOICES = [
        ('granite', 'Гранит'),
        ('marble', 'Мрамор'),
        ('labradorite', 'Лабрадорит'),
        ('gabbro', 'Габбро'),
    ]
    STYLE_CHOICES = [
        ('classic', 'Классика'),
        ('modern', 'Минимализм'),
        ('author', 'Авторские'),
    ]
    TYPE_CHOICES = [
        ('single', 'Одиночные'),
        ('double', 'Двойные'),
        ('svo', 'СВО'),
        ('complex', 'Комплексы'),
    ]

    sku = models.CharField(max_length=32, unique=True)
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=200)
    material = models.CharField(max_length=32, choices=MATERIAL_CHOICES)
    style = models.CharField(max_length=32, choices=STYLE_CHOICES)
    product_type = models.CharField(max_length=32, choices=TYPE_CHOICES)
    material_label = models.CharField(max_length=200)
    price = models.PositiveIntegerField()
    image_url = models.URLField(max_length=1000)
    description = models.TextField(blank=True)
    dimensions = models.CharField(max_length=200, blank=True)
    finish = models.CharField(max_length=200, blank=True)
    featured = models.BooleanField(default=False)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products',
    )
    extra_services = models.ManyToManyField(
        'ExtraService',
        blank=True,
        related_name='products',
        verbose_name='Дополнительные услуги',
    )

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name='Товар',
    )
    image_url = models.URLField('Ссылка на изображение', max_length=1000)
    alt_text = models.CharField('Описание изображения', max_length=250, blank=True)
    sort_order = models.PositiveIntegerField('Порядок', default=0)

    class Meta:
        ordering = ['sort_order', 'id']
        verbose_name = 'Изображение товара'
        verbose_name_plural = 'Изображения товара'

    def __str__(self):
        return self.alt_text or f'{self.product.name} — изображение {self.pk}'


class ExtraService(models.Model):
    slug = models.SlugField('Код', unique=True)
    title = models.CharField('Название', max_length=200)
    description = models.TextField('Описание', blank=True)
    price = models.PositiveIntegerField('Цена', null=True, blank=True)
    is_active = models.BooleanField('Показывать на сайте', default=True)
    sort_order = models.PositiveIntegerField('Порядок', default=0)

    class Meta:
        ordering = ['sort_order', 'title']
        verbose_name = 'Дополнительная услуга'
        verbose_name_plural = 'Дополнительные услуги'

    def __str__(self):
        return self.title


class SitePage(models.Model):
    slug = models.SlugField('Код страницы', unique=True)
    title = models.CharField('Название страницы', max_length=200)
    meta_title = models.CharField('SEO-заголовок', max_length=250, blank=True)
    meta_description = models.TextField('SEO-описание', blank=True)
    is_published = models.BooleanField('Опубликована', default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['title']
        verbose_name = 'Страница сайта'
        verbose_name_plural = 'Страницы сайта'

    def __str__(self):
        return self.title


class ContentBlock(models.Model):
    page = models.ForeignKey(
        SitePage,
        on_delete=models.CASCADE,
        related_name='blocks',
        verbose_name='Страница',
    )
    key = models.SlugField('Код блока', max_length=100)
    title = models.CharField('Заголовок', max_length=250, blank=True)
    body = models.TextField('Текст', blank=True)
    image_url = models.URLField('Ссылка на изображение', max_length=1000, blank=True)
    button_label = models.CharField('Текст кнопки', max_length=100, blank=True)
    button_url = models.CharField('Ссылка кнопки', max_length=500, blank=True)
    extra_data = models.JSONField('Дополнительные данные', default=dict, blank=True)
    is_enabled = models.BooleanField('Показывать блок', default=True)
    sort_order = models.PositiveIntegerField('Порядок', default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', 'id']
        constraints = [
            models.UniqueConstraint(
                fields=['page', 'key'],
                name='unique_content_block_key_per_page',
            ),
        ]
        verbose_name = 'Блок страницы'
        verbose_name_plural = 'Блоки страниц'

    def __str__(self):
        return f'{self.page.title}: {self.title or self.key}'


class Review(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='reviews',
    )
    author = models.CharField(max_length=120)
    text = models.TextField()
    rating = models.PositiveSmallIntegerField(default=5)
    image_url = models.TextField(blank=True)
    is_video = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at', 'sort_order']

    def __str__(self):
        return self.author


class PortfolioItem(models.Model):
    title = models.CharField(max_length=200)
    material = models.CharField(max_length=200)
    city = models.CharField(max_length=120)
    image_url = models.URLField(max_length=1000)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order']

    def __str__(self):
        return self.title


class OfficeLocation(models.Model):
    REGION_CHOICES = [
        ('krasnodar_krai', 'Краснодарский край'),
        ('adygea', 'Республика Адыгея'),
        ('other', 'Другие регионы'),
    ]

    city = models.CharField(max_length=120)
    slug = models.SlugField(unique=True)
    address = models.CharField(max_length=300, blank=True)
    phone = models.CharField(max_length=40, blank=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    is_headquarters = models.BooleanField(default=False)
    is_highlighted = models.BooleanField(default=False)
    region = models.CharField(max_length=32, choices=REGION_CHOICES, default='krasnodar_krai')
    projects_count = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['-is_headquarters', '-is_highlighted', 'city']

    def __str__(self):
        return self.city


class ConsultationRequest(models.Model):
    name = models.CharField(max_length=120)
    phone = models.CharField(max_length=40)
    monument_type = models.CharField(max_length=80, blank=True)
    material = models.CharField(max_length=80, blank=True)
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} — {self.phone}'
