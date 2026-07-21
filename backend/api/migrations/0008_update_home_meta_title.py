from django.db import migrations

SITE_TITLE = 'КавказКамень - производство и установка памятников'


def update_home_title(apps, schema_editor):
    SitePage = apps.get_model('api', 'SitePage')
    SitePage.objects.filter(slug='home').update(meta_title=SITE_TITLE)


def revert_home_title(apps, schema_editor):
    SitePage = apps.get_model('api', 'SitePage')
    SitePage.objects.filter(slug='home').update(
        meta_title='КавказКамень — памятники по всей России'
    )


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_update_company_requisites'),
    ]

    operations = [
        migrations.RunPython(update_home_title, revert_home_title),
    ]
