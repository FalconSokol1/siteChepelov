from django.db import migrations

SEO_UPDATES = {
    'home': {
        'meta_description': (
            'КавказКамень — производство и установка памятников из гранита и мрамора. '
            'пос. Родники, Краснодарский край. Изготовление, доставка и монтаж по всей России.'
        ),
    },
    'catalog': {
        'meta_description': (
            'Каталог памятников из гранита, мрамора, лабрадорита и габбро. '
            'Одиночные, двойные, комплексы и памятники СВО. Цены и фото.'
        ),
    },
    'product': {
        'meta_description': (
            'Карточка памятника: фото, цена, материал, размеры и дополнительные услуги. '
            'КавказКамень — изготовление и установка под ключ.'
        ),
    },
    'map': {
        'meta_description': (
            'Адрес офиса КавказКамень: пос. Родники, ул. Лесная, 70. '
            'Карта проезда и контакты для консультации.'
        ),
    },
    'reviews': {
        'meta_description': (
            'Отзывы клиентов о памятниках и работе КавказКамень. '
            'Реальные оценки качества камня, монтажа и сервиса.'
        ),
    },
    'portfolio': {
        'meta_description': (
            'Портфолио готовых памятников КавказКамень: фото работ, материалы и города установки.'
        ),
    },
}


def update_seo(apps, schema_editor):
    SitePage = apps.get_model('api', 'SitePage')
    for slug, data in SEO_UPDATES.items():
        SitePage.objects.filter(slug=slug).update(**data)


def revert_seo(apps, schema_editor):
    SitePage = apps.get_model('api', 'SitePage')
    SitePage.objects.filter(slug='home').update(
        meta_description='Изготовление и установка памятников из гранита и мрамора под ключ.'
    )


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_update_home_meta_title'),
    ]

    operations = [
        migrations.RunPython(update_seo, revert_seo),
    ]
