from django.db import migrations

NEW_EMAIL = 'kavkazkamen_official@mail.ru'
OLD_EMAIL = 'info@chepelov.ru'


def forwards(apps, schema_editor):
    ContentBlock = apps.get_model('api', 'ContentBlock')

    for block in ContentBlock.objects.filter(key='company'):
        extra = dict(block.extra_data or {})
        if extra.get('email') == OLD_EMAIL or not extra.get('email'):
            extra['email'] = NEW_EMAIL
            block.extra_data = extra
            block.save(update_fields=['extra_data'])

    for block in ContentBlock.objects.all():
        changed_fields = []
        if block.body and OLD_EMAIL in block.body:
            block.body = block.body.replace(OLD_EMAIL, NEW_EMAIL)
            changed_fields.append('body')
        if block.body and 'заявк' in block.body.lower():
            replacements = (
                ('Оставьте заявку — менеджер свяжется в течение 30 минут',
                 'Позвоните или напишите — менеджер ответит в течение 30 минут'),
                ('обработки заявки, обратной связи',
                 'ответа на обращение, обратной связи'),
                ('Отправить заявку', 'Связаться с нами'),
            )
            for old, new in replacements:
                if old in block.body:
                    block.body = block.body.replace(old, new)
                    if 'body' not in changed_fields:
                        changed_fields.append('body')
        if block.button_label and 'заявк' in block.button_label.lower():
            block.button_label = 'Связаться с нами'
            changed_fields.append('button_label')
        extra = dict(block.extra_data or {})
        extra_changed = False
        for key, value in list(extra.items()):
            if isinstance(value, str):
                if OLD_EMAIL in value:
                    extra[key] = value.replace(OLD_EMAIL, NEW_EMAIL)
                    extra_changed = True
                if 'заявк' in value.lower():
                    text = extra[key]
                    text = text.replace('Заявка отправлена! Мы скоро свяжемся с вами.',
                                        'Спасибо! Мы скоро свяжемся с вами.')
                    text = text.replace('заявку', 'обращение').replace('Заявку', 'Обращение')
                    text = text.replace('заявки', 'обращения').replace('Заявки', 'Обращения')
                    text = text.replace('заявка', 'обращение').replace('Заявка', 'Обращение')
                    extra[key] = text
                    extra_changed = True
        if extra_changed:
            block.extra_data = extra
            changed_fields.append('extra_data')
        if changed_fields:
            block.save(update_fields=list(dict.fromkeys(changed_fields)))


def backwards(apps, schema_editor):
    ContentBlock = apps.get_model('api', 'ContentBlock')
    for block in ContentBlock.objects.filter(key='company'):
        extra = dict(block.extra_data or {})
        if extra.get('email') == NEW_EMAIL:
            extra['email'] = OLD_EMAIL
            block.extra_data = extra
            block.save(update_fields=['extra_data'])
    for block in ContentBlock.objects.all():
        if block.body and NEW_EMAIL in block.body:
            block.body = block.body.replace(NEW_EMAIL, OLD_EMAIL)
            block.save(update_fields=['body'])


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_update_seo_meta_descriptions'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
