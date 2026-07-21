import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "kavkazkamen.settings")
django.setup()
from api.models import OfficeLocation, PortfolioItem
OfficeLocation.objects.filter(city="Майкоп").update(is_highlighted=True, region="adygea")
OfficeLocation.objects.filter(city="Белореченск").update(is_highlighted=True, region="krasnodar_krai")
city_map = {
    "Мемориальный комплекс": "Майкоп",
    "Двойной памятник": "Белореченск",
    "Авторский комплекс": "Краснодар",
    "Классический памятник": "Сочи",
    "Семейный комплекс": "Новороссийск",
    "Памятник с гравировкой": "Анапа",
}
for item in PortfolioItem.objects.all():
    for prefix, city in city_map.items():
        if item.title.startswith(prefix):
            item.city = city
            item.save(update_fields=["city"])
            break
for loc in OfficeLocation.objects.filter(is_highlighted=True):
    print(loc.city, loc.region)
for item in PortfolioItem.objects.all():
    print(item.title, "->", item.city)