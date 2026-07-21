from pathlib import Path

import xlwt
from django.conf import settings
from django.core.management.base import BaseCommand

from api.data.price_catalog import (
    CATALOG,
    CATEGORY_PRICE_FROM,
    MIN_PRICE,
    SITE_BASE,
    YANDEX_HEADERS,
)
from api.models import Category, ExtraService, Product, ProductImage


def catalog_row_to_yandex(row):
    yandex_cat, sku, name, short, description, price, image, popular, unit, path = row[:10]
    return {
        'category': yandex_cat,
        'name': name,
        'id': sku,
        'description': description,
        'short': short,
        'price': max(int(price), MIN_PRICE),
        'image': image,
        'popular': popular,
        'in_stock': 'Да',
        'qty': 1,
        'unit': unit,
        'url': f'{SITE_BASE}{path}',
    }


class Command(BaseCommand):
    help = 'Синхронизировать каталог товаров/услуг и выгрузить прайс-лист Яндекс (.xls)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--export',
            default='',
            help='Путь для сохранения xls',
        )
        parser.add_argument(
            '--no-export',
            action='store_true',
            help='Только обновить базу',
        )

    def handle(self, *args, **options):
        products_count = 0
        services_count = 0
        categories = {c.slug: c for c in Category.objects.all()}

        for cat_slug, price_from in CATEGORY_PRICE_FROM.items():
            if cat_slug in categories:
                cat = categories[cat_slug]
                cat.price_from = price_from
                cat.save(update_fields=['price_from'])

        all_services = []

        for row in CATALOG:
            kind = row[10]
            if kind == 'service':
                slug = row[11]
                sort_order = row[12]
                item = catalog_row_to_yandex(row)
                service, _ = ExtraService.objects.update_or_create(
                    slug=slug,
                    defaults={
                        'title': item['name'],
                        'description': item['description'],
                        'price': item['price'],
                        'sort_order': sort_order,
                        'is_active': True,
                    },
                )
                all_services.append(service)
                services_count += 1
            else:
                (
                    _yc,
                    sku,
                    name,
                    _short,
                    description,
                    price,
                    image,
                    _pop,
                    _unit,
                    _path,
                    _kind,
                    slug,
                    material,
                    style,
                    product_type,
                    material_label,
                    dimensions,
                    finish,
                    category_slug,
                    featured,
                ) = row
                category = categories.get(category_slug)
                product, created = Product.objects.update_or_create(
                    sku=sku,
                    defaults={
                        'slug': slug,
                        'name': name,
                        'material': material,
                        'style': style,
                        'product_type': product_type,
                        'material_label': material_label,
                        'price': max(int(price), MIN_PRICE),
                        'image_url': image,
                        'description': description,
                        'dimensions': dimensions,
                        'finish': finish,
                        'featured': featured,
                        'category': category,
                    },
                )
                if created or not ProductImage.objects.filter(product=product).exists():
                    ProductImage.objects.filter(product=product).delete()
                    ProductImage.objects.create(
                        product=product,
                        image_url=image,
                        alt_text=name,
                        sort_order=0,
                    )
                product.extra_services.set(all_services)
                products_count += 1

        catalog_skus = {row[1] for row in CATALOG if row[10] == 'product'}
        catalog_service_slugs = {row[11] for row in CATALOG if row[10] == 'service'}
        removed_p = Product.objects.exclude(sku__in=catalog_skus).delete()[0]
        removed_s = ExtraService.objects.exclude(slug__in=catalog_service_slugs).delete()[0]

        self.stdout.write(
            self.style.SUCCESS(
                f'Каталог: {products_count} товаров, {services_count} услуг. '
                f'Удалено: {removed_p} товаров, {removed_s} услуг.'
            )
        )

        if not options['no_export']:
            default_path = Path(settings.BASE_DIR) / 'data' / 'price-list-kavkazkamen.xls'
            export_path = options['export'] or str(default_path)
            self.export_xls(export_path, CATALOG)
            self.stdout.write(self.style.SUCCESS(f'Прайс-лист: {export_path}'))

    def export_xls(self, path: str, catalog):
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        wb = xlwt.Workbook(encoding='utf-8')
        ws = wb.add_sheet('Прайс-лист')

        for col, header in enumerate(YANDEX_HEADERS):
            ws.write(0, col, header)

        for row_idx, row in enumerate(catalog, start=1):
            item = catalog_row_to_yandex(row)
            values = [
                item['category'],
                item['name'],
                item['id'],
                item['description'],
                item['short'],
                item['price'],
                item['image'],
                item['popular'],
                item['in_stock'],
                item['qty'],
                item['unit'],
                item['url'],
            ]
            for col, value in enumerate(values):
                ws.write(row_idx, col, value)

        wb.save(path)
