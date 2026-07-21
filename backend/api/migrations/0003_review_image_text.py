from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_alter_officelocation_options_alter_review_options_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='review',
            name='image_url',
            field=models.TextField(blank=True),
        ),
    ]
