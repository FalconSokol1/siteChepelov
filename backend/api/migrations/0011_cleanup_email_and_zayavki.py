from django.db import migrations

NEW_EMAIL = 'kavkazkamen_official@mail.ru'
OLD_EMAIL = 'info@chepelov.ru'


def forwards(apps, schema_editor):
    ContentBlock = apps.get_model('api', 'ContentBlock')

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
        if block.key == 'company' and (extra.get('email') == OLD_EMAIL or not extra.get('email')):
            extra['email'] = NEW_EMAIL
            extra_changed = True
        for key, value in list(extra.items()):
            if not isinstance(value, str):
                continue
            text = value
            if OLD_EMAIL in text:
                text = text.replace(OLD_EMAIL, NEW_EMAIL)
            if 'заявк' in text.lower():
                text = text.replace('Заявка отправлена! Мы скоро свяжемся с вами.',
                                    'Спасибо! Мы скоро свяжемся с вами.')
                text = text.replace('заявку', 'обращение').replace('Заявку', 'Обращение')
                text = text.replace('заявки', 'обращения').replace('Заявки', 'Обращения')
                text = text.replace('заявка', 'обращение').replace('Заявка', 'Обращение')
            if text != value:
                extra[key] = text
                extra_changed = True
        if extra_changed:
            block.extra_data = extra
            changed_fields.append('extra_data')

        if changed_fields:
            block.save(update_fields=list(dict.fromkeys(changed_fields)))


def backwards(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_update_email_and_cta'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
