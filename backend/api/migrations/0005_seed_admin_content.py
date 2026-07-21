from django.db import migrations


DEFAULT_SERVICES = [
    ('engraving', 'Художественная гравировка', 'Портрет, эпитафия, декоративные элементы', 45000, 0),
    ('install', 'Установка под ключ', 'Фундамент, монтаж, выравнивание на месте', 28000, 1),
    ('delivery', 'Доставка до кладбища', 'Погрузка и транспортировка', 12000, 2),
    ('fence', 'Ограда из гранита', 'Изготовление и установка ограды', 35000, 3),
    ('care', 'Уход за памятником', 'Мойка и полировка', 8500, 4),
    ('mosaic', 'Портретная мозаика', 'Цветная каменная мозаика по фото', 62000, 5),
]


def seed_admin_content(apps, schema_editor):
    ExtraService = apps.get_model('api', 'ExtraService')
    Product = apps.get_model('api', 'Product')
    ProductImage = apps.get_model('api', 'ProductImage')
    SitePage = apps.get_model('api', 'SitePage')
    ContentBlock = apps.get_model('api', 'ContentBlock')

    services = []
    for slug, title, description, price, sort_order in DEFAULT_SERVICES:
        service, _ = ExtraService.objects.update_or_create(
            slug=slug,
            defaults={
                'title': title,
                'description': description,
                'price': price,
                'sort_order': sort_order,
                'is_active': True,
            },
        )
        services.append(service)

    for product in Product.objects.all():
        if product.image_url and not ProductImage.objects.filter(product=product).exists():
            ProductImage.objects.create(
                product=product,
                image_url=product.image_url,
                alt_text=product.name,
                sort_order=0,
            )
        if not product.extra_services.exists():
            product.extra_services.set(services)

    home, _ = SitePage.objects.get_or_create(
        slug='home',
        defaults={
            'title': 'Главная',
            'meta_title': 'КавказКамень — памятники по всей России',
            'is_published': True,
        },
    )
    ContentBlock.objects.get_or_create(
        page=home,
        key='hero',
        defaults={
            'title': 'КавказКамень — изготовление, производство и установка памятников по всей России',
            'body': 'Выполняем заказы от эскиза до монтажа под ключ.',
            'button_label': 'Получить каталог',
            'button_url': '/catalog',
            'sort_order': 0,
            'is_enabled': True,
        },
    )


def reverse_seed(apps, schema_editor):
    SitePage = apps.get_model('api', 'SitePage')
    SitePage.objects.filter(slug='home').delete()


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0004_extraservice_sitepage_product_extra_services_and_more'),
    ]

    operations = [
        migrations.RunPython(seed_admin_content, reverse_seed),
    ]
