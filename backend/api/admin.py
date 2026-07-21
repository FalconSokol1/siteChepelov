from django import forms
from django.contrib import admin, messages
from django.core.exceptions import ValidationError
from django.shortcuts import redirect, render
from django.urls import path, reverse

from .admin_import import import_catalog
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


class CatalogImportForm(forms.Form):
    file = forms.FileField(
        label='CSV или XLSX',
        help_text=(
            'CSV импортирует товары. XLSX может содержать листы «products»/«товары» '
            'и «services»/«услуги». Максимум 5 МБ.'
        ),
    )


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image_url', 'alt_text', 'sort_order')
    ordering = ('sort_order', 'id')


class ContentBlockInline(admin.StackedInline):
    model = ContentBlock
    extra = 0
    fields = (
        'key',
        'title',
        'body',
        'image_url',
        ('button_label', 'button_url'),
        'extra_data',
        ('is_enabled', 'sort_order'),
    )
    ordering = ('sort_order', 'id')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'price_from', 'sort_order')
    list_editable = ('sort_order',)
    search_fields = ('title', 'slug')
    prepopulated_fields = {'slug': ('title',)}
    ordering = ('sort_order', 'title')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    change_list_template = 'admin/api/product/change_list.html'
    list_display = ('sku', 'name', 'category', 'material', 'product_type', 'featured')
    list_filter = ('featured', 'material', 'style', 'product_type', 'category')
    search_fields = ('sku', 'name', 'description', 'material_label')
    prepopulated_fields = {'slug': ('name',)}
    autocomplete_fields = ('category',)
    filter_horizontal = ('extra_services',)
    readonly_fields = ('image_preview',)
    inlines = (ProductImageInline,)
    fieldsets = (
        ('Основное', {
            'fields': ('sku', 'slug', 'name', 'category', 'featured'),
        }),
        ('Характеристики', {
            'fields': (
                'material',
                'style',
                'product_type',
                'material_label',
                'dimensions',
                'finish',
                'price',
            ),
        }),
        ('Описание и главное изображение', {
            'fields': ('description', 'image_url', 'image_preview'),
        }),
        ('С памятником заказывают', {
            'fields': ('extra_services',),
        }),
    )

    @admin.display(description='Предпросмотр')
    def image_preview(self, obj):
        if not obj or not obj.image_url:
            return 'Изображение не указано'
        from django.utils.html import format_html
        return format_html(
            '<img src="{}" alt="" style="max-width:240px;max-height:180px;object-fit:contain">',
            obj.image_url,
        )

    def get_urls(self):
        return [
            path(
                'import/',
                self.admin_site.admin_view(self.import_view),
                name='api_product_import',
            ),
            *super().get_urls(),
        ]

    def import_view(self, request):
        if not self.has_add_permission(request):
            from django.core.exceptions import PermissionDenied
            raise PermissionDenied

        form = CatalogImportForm(request.POST or None, request.FILES or None)
        if request.method == 'POST' and form.is_valid():
            try:
                result = import_catalog(form.cleaned_data['file'])
            except ValidationError as exc:
                form.add_error('file', exc)
            else:
                messages.success(
                    request,
                    (
                        f'Импорт завершён. Товары: создано {result["products_created"]}, '
                        f'обновлено {result["products_updated"]}; услуги: создано '
                        f'{result["services_created"]}, обновлено {result["services_updated"]}.'
                    ),
                )
                for error in result['errors'][:20]:
                    messages.warning(request, error)
                if len(result['errors']) > 20:
                    messages.warning(request, 'Показаны первые 20 ошибок импорта.')
                return redirect(reverse('admin:api_product_changelist'))

        context = {
            **self.admin_site.each_context(request),
            'title': 'Импорт каталога',
            'opts': self.model._meta,
            'form': form,
        }
        return render(request, 'admin/api/product/import.html', context)


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'alt_text', 'sort_order')
    list_editable = ('sort_order',)
    search_fields = ('product__name', 'product__sku', 'alt_text')
    autocomplete_fields = ('product',)


@admin.register(ExtraService)
class ExtraServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'price', 'is_active', 'sort_order')
    list_editable = ('price', 'is_active', 'sort_order')
    list_filter = ('is_active',)
    search_fields = ('title', 'slug', 'description')
    prepopulated_fields = {'slug': ('title',)}
    ordering = ('sort_order', 'title')


@admin.register(SitePage)
class SitePageAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'is_published', 'updated_at')
    list_editable = ('is_published',)
    list_filter = ('is_published',)
    search_fields = ('title', 'slug', 'meta_title', 'meta_description')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('updated_at',)
    inlines = (ContentBlockInline,)


@admin.register(ContentBlock)
class ContentBlockAdmin(admin.ModelAdmin):
    list_display = ('title_or_key', 'page', 'key', 'is_enabled', 'sort_order', 'updated_at')
    list_editable = ('is_enabled', 'sort_order')
    list_filter = ('page', 'is_enabled')
    search_fields = ('title', 'key', 'body')
    autocomplete_fields = ('page',)
    ordering = ('page', 'sort_order', 'id')

    @admin.display(description='Блок')
    def title_or_key(self, obj):
        return obj.title or obj.key


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('author', 'rating', 'created_at', 'is_video')
    list_filter = ('rating', 'is_video', 'created_at')
    search_fields = ('author', 'text')
    readonly_fields = ('created_at',)


@admin.register(PortfolioItem)
class PortfolioItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'material', 'city', 'sort_order')
    list_editable = ('sort_order',)
    search_fields = ('title', 'material', 'city')
    ordering = ('sort_order',)


@admin.register(OfficeLocation)
class OfficeLocationAdmin(admin.ModelAdmin):
    list_display = ('city', 'address', 'phone', 'is_headquarters', 'is_highlighted')
    list_filter = ('region', 'is_headquarters', 'is_highlighted')
    search_fields = ('city', 'address', 'phone')
    prepopulated_fields = {'slug': ('city',)}


@admin.register(ConsultationRequest)
class ConsultationRequestAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'monument_type', 'created_at')
    list_filter = ('created_at', 'material')
    search_fields = ('name', 'phone', 'message')
    readonly_fields = (
        'name',
        'phone',
        'monument_type',
        'material',
        'message',
        'created_at',
    )

    def has_add_permission(self, request):
        return False


admin.site.site_header = 'КавказКамень — управление сайтом'
admin.site.site_title = 'КавказКамень'
admin.site.index_title = 'Администрирование'
