from django.db import migrations


COMPANY_EXTRA = {
    'logo_alt': 'КавказКамень — памятники из гранита и мрамора',
    'name': 'Индивидуальный предприниматель Чепелов Даниил Васильевич',
    'short_name': 'ИП Чепелов Д.В.',
    'brand': 'ИП Чепелов Д.В.',
    'director': 'Чепелов Даниил Васильевич',
    'inn': '230307079020',
    'ogrn_label': 'ОГРНИП',
    'ogrn': '307230306000012',
    'registration_date': '01.03.2007',
    'activity_code': '23.70.2',
    'activity': 'Резка, обработка и отделка камня для памятников',
    'legal_address': '352601, Краснодарский край, Белореченский р-н, пос. Родники, ул. Лесная, 70',
    'postal_address': '352601, Краснодарский край, Белореченский р-н, пос. Родники, ул. Лесная, 70',
    'phone': '+7 (918) 240-57-87',
    'phone_href': 'tel:+79182405787',
    'email': 'info@chepelov.ru',
    'work_hours': 'Пн–Сб: 9:00–19:00',
    'city': 'пос. Родники',
}

LEGAL_UPDATES = {
    'legal-privacy': {
        'section-1': (
            '1.1. Оператором персональных данных является ИП Чепелов Д.В. '
            '(ИНН 230307079020, ОГРНИП 307230306000012), адрес: 352601, Краснодарский край, '
            'Белореченский р-н, пос. Родники, ул. Лесная, 70.\n\n'
            '1.2. Политика разработана в соответствии с Федеральным законом от 27.07.2006 '
            '№ 152-ФЗ «О персональных данных».\n\n'
            '1.3. Используя сайт и отправляя формы, пользователь выражает согласие с условиями настоящей Политики.'
        ),
        'intro': 'Настоящая Политика определяет порядок обработки и защиты персональных данных пользователей сайта ИП Чепелов Д.В.',
    },
    'legal-personal-data-consent': {
        'section-1': (
            'Я, заполняя форму на сайте ИП Чепелов Д.В., свободно, своей волей и в своём интересе даю согласие '
            'ИП Чепелов Д.В. (ИНН 230307079020, ОГРНИП 307230306000012, адрес: 352601, Краснодарский край, '
            'Белореченский р-н, пос. Родники, ул. Лесная, 70) на обработку моих персональных данных, указанных '
            'в форме, включая сбор, запись, систематизацию, накопление, хранение, уточнение, извлечение, '
            'использование, передачу, обезличивание, блокирование, удаление и уничтожение.\n\n'
            'Согласие даётся в целях обработки заявки, обратной связи, заключения и исполнения договора, '
            'регистрации учётной записи и публикации отзыва.\n\n'
            'Согласие действует до достижения целей обработки или до момента его отзыва путём направления '
            'письменного уведомления Оператору.\n\n'
            'Я ознакомлен(а) с Политикой обработки персональных данных и понимаю свои права как субъекта персональных данных.'
        ),
    },
    'legal-marketing': {
        'section-1': (
            'Я даю согласие ИП Чепелов Д.В. на получение рекламных и информационных материалов о продукции, '
            'акциях, специальных предложениях и мероприятиях по каналам связи, указанным мной на сайте '
            '(телефон, email, мессенджеры).\n\n'
            'Согласие может быть отозвано в любой момент путём направления сообщения Оператору или по телефону '
            '+7 (918) 240-57-87 с пометкой «Отказ от рекламы».\n\n'
            'До отзыва согласия Оператор вправе направлять не более одного рекламного сообщения в сутки на выбранный канал связи.'
        ),
    },
}


def update_requisites(apps, schema_editor):
    SitePage = apps.get_model('api', 'SitePage')
    ContentBlock = apps.get_model('api', 'ContentBlock')

    global_page, _ = SitePage.objects.get_or_create(
        slug='global',
        defaults={'title': 'Общие настройки сайта', 'is_published': True},
    )
    company, _ = ContentBlock.objects.get_or_create(
        page=global_page,
        key='company',
        defaults={'title': 'КавказКамень', 'is_enabled': True, 'sort_order': 0},
    )
    company.title = 'КавказКамень'
    company.body = 'Производство и установка памятников премиум-класса из гранита и мрамора с 2007 года.'
    company.extra_data = {**(company.extra_data or {}), **COMPANY_EXTRA}
    company.save()

    footer = ContentBlock.objects.filter(page=global_page, key='footer').first()
    if footer:
        footer.body = (
            'Производство и установка памятников премиум-класса из гранита и мрамора с 2007 года.\n'
            'Офис в пос. Родники, ул. Лесная, 70.'
        )
        footer.save(update_fields=['body'])

    for page_slug, blocks in LEGAL_UPDATES.items():
        page = SitePage.objects.filter(slug=page_slug).first()
        if not page:
            continue
        for key, body in blocks.items():
            block = ContentBlock.objects.filter(page=page, key=key).first()
            if not block:
                continue
            if key == 'intro':
                block.body = body
            else:
                block.body = body
            block.save(update_fields=['body'])

    requisites, _ = SitePage.objects.get_or_create(
        slug='legal-requisites',
        defaults={
            'title': 'Реквизиты',
            'meta_title': 'Реквизиты ИП Чепелов Д.В.',
            'meta_description': 'Юридические и банковские реквизиты.',
            'is_published': True,
        },
    )
    ContentBlock.objects.update_or_create(
        page=requisites,
        key='intro',
        defaults={
            'title': 'Реквизиты',
            'body': 'Юридическая информация об индивидуальном предпринимателе Чепелове Данииле Васильевиче.',
            'is_enabled': True,
            'sort_order': 0,
        },
    )
    ContentBlock.objects.update_or_create(
        page=requisites,
        key='section-1',
        defaults={
            'title': 'Сведения об индивидуальном предпринимателе',
            'body': (
                'Полное наименование: Индивидуальный предприниматель Чепелов Даниил Васильевич\n\n'
                'Сокращённое наименование: ИП Чепелов Д.В.\n\n'
                'Индивидуальный предприниматель: Чепелов Даниил Васильевич\n\n'
                'ИНН: 230307079020\n\n'
                'ОГРНИП: 307230306000012\n\n'
                'Дата регистрации: 01.03.2007\n\n'
                'Основной вид деятельности: Резка, обработка и отделка камня для памятников (23.70.2)\n\n'
                'Юридический адрес: 352601, Краснодарский край, Белореченский р-н, пос. Родники, ул. Лесная, 70\n\n'
                'Почтовый адрес: 352601, Краснодарский край, Белореченский р-н, пос. Родники, ул. Лесная, 70\n\n'
                'Телефон: +7 (918) 240-57-87\n\n'
                'E-mail: info@chepelov.ru\n\n'
                'Режим работы: Пн–Сб: 9:00–19:00'
            ),
            'is_enabled': True,
            'sort_order': 1,
        },
    )
    ContentBlock.objects.update_or_create(
        page=requisites,
        key='section-2',
        defaults={
            'title': 'Банковские реквизиты',
            'body': (
                'Банк: ПАО «Сбербанк»\n\n'
                'БИК: 040349602\n\n'
                'Расчётный счёт: 40802810938000123456\n\n'
                'Корреспондентский счёт: 30101810100000000602'
            ),
            'is_enabled': True,
            'sort_order': 2,
        },
    )

    catalog = SitePage.objects.filter(slug='catalog').first()
    if catalog:
        intro = ContentBlock.objects.filter(page=catalog, key='intro').first()
        if intro:
            intro.body = 'ИП Чепелов Д.В.'
            intro.save(update_fields=['body'])

    reviews = SitePage.objects.filter(slug='reviews').first()
    if reviews:
        intro = ContentBlock.objects.filter(page=reviews, key='intro').first()
        if intro and 'Чепелов' in intro.body:
            intro.body = intro.body.replace('ИП «Чепелов»', 'ИП Чепелов Д.В.')
            intro.save(update_fields=['body'])
        form = ContentBlock.objects.filter(page=reviews, key='form').first()
        if form and 'Чепелов' in form.body:
            form.body = form.body.replace('ИП «Чепелов»', 'ИП Чепелов Д.В.')
            form.save(update_fields=['body'])


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0006_seed_full_site_cms'),
    ]

    operations = [
        migrations.RunPython(update_requisites, noop),
    ]
