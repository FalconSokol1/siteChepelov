"""Каталог товаров и услуг КавказКамень для сайта и прайс-листа Яндекс."""

SITE_BASE = 'https://kavkazkamen.ru'
MIN_PRICE = 10_000

DEFAULT_IMAGE = (
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB3TQzYLSdzTQdNcPY6wjwxodpJa75sDp0ERJGMEq6VSWhAaSauc8QElqTGJv1tM2IBG2fzfW4_R26FMZNSAdQW6kqSG3mtl8fORv0oRPQtVhODMtwykuZ4ywctIoO8G0rVx_QAaZR7OIsiGyaAiAJRC5__hbHWGIIjkcp0EmdMKV1XyAr3PQpiMN-WeYxQvO4xerRyZFeF80lDyupwaZh7ayfRbRpMCmZ8l7ViHcBmRER1uhEPzsjv4DAV9tozO4mIAGifKhqyYZc'
)

# (yandex_category, sku, name, short, description, price, image, popular, unit, path, kind, ...)
# kind: product | service

CATALOG = [
    ('Услуги', 'SRV-001', 'Консультация и выезд на кладбище', 'Консультация', 'Выезд специалиста, замеры, подбор материала и формы памятника.', 10000, DEFAULT_IMAGE, 'Нет', 'услуга', '/catalog', 'service', 'consult', 0),
    ('Услуги', 'SRV-002', 'Доставка до кладбища', 'Доставка', 'Погрузка и транспортировка памятника до места установки.', 12000, DEFAULT_IMAGE, 'Нет', 'услуга', '/catalog', 'service', 'delivery', 1),
    ('Услуги', 'SRV-003', 'Установка памятника под ключ', 'Установка', 'Фундамент, монтаж, выравнивание и сдача объекта.', 28000, DEFAULT_IMAGE, 'Да', 'услуга', '/catalog', 'service', 'install', 2),
    ('Услуги', 'SRV-004', 'Гравировка эпитафии', 'Эпитафия', 'Нанесение текста, дат и символики на камень.', 10000, DEFAULT_IMAGE, 'Нет', 'услуга', '/catalog', 'service', 'epitaph', 3),
    ('Услуги', 'SRV-005', 'Художественная гравировка портрета', 'Портрет', 'Портрет, эпитафия и декоративные элементы.', 45000, DEFAULT_IMAGE, 'Да', 'услуга', '/catalog', 'service', 'engraving', 4),
    ('Услуги', 'SRV-006', 'Портретная мозаика', 'Мозаика', 'Цветная каменная мозаика по фотографии.', 62000, DEFAULT_IMAGE, 'Нет', 'услуга', '/catalog', 'service', 'mosaic', 5),
    ('Услуги', 'SRV-007', 'Ограда из гранита с монтажом', 'Ограда', 'Изготовление и установка гранитной ограды.', 35000, DEFAULT_IMAGE, 'Нет', 'услуга', '/catalog', 'service', 'fence', 6),
    ('Услуги', 'SRV-008', 'Уход за памятником', 'Уход', 'Мойка, полировка и защита камня — 1 год.', 10000, DEFAULT_IMAGE, 'Нет', 'услуга', '/catalog', 'service', 'care', 7),
    ('Услуги', 'SRV-009', '3D-визуализация памятника', '3D-макет', 'Цифровой макет памятника до начала производства.', 15000, DEFAULT_IMAGE, 'Нет', 'услуга', '/catalog', 'service', 'visual3d', 8),
    ('Услуги', 'SRV-010', 'Благоустройство могилы', 'Благоустройство', 'Отсыпка, плитка, выравнивание участка.', 25000, DEFAULT_IMAGE, 'Нет', 'услуга', '/catalog', 'service', 'landscaping', 9),

    ('Памятники', 'KK-2001', 'Памятник «Стандарт»', 'Гранит 80×40', 'Одиночный памятник из гранита, зеркальная полировка.', 45000, DEFAULT_IMAGE, 'Да', 'комплект', '/catalog/standart', 'product', 'standart', 'granite', 'classic', 'single', 'ГРАНИТ / СТАНДАРТ', '80×40×5 см', 'Зеркальная полировка', 'granite-monuments', True),
    ('Памятники', 'KK-2002', 'Памятник «Классика»', 'Гранит 100×50', 'Классическая форма, гранит, полировка.', 52000, DEFAULT_IMAGE, 'Да', 'комплект', '/catalog/klassika', 'product', 'klassika', 'granite', 'classic', 'single', 'ГРАНИТ / КЛАССИКА', '100×50×8 см', 'Зеркальная полировка', 'granite-monuments', True),
    ('Памятники', 'KK-1002', 'Памятник «Горизонт»', 'Минимализм', 'Современный памятник из гранита.', 185000, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuCbp9AbqlDh2sKceFyqC4feT2VH3Vm10UFcbXyt7QFhnudSZHpUiJ4m7Cj88M4KC4F6rWrdhOBY20ONXdyV8NSzDiy__LE5xjDkQf9rQhh5dMx4Bpb6D-xQbzk31RXhUxse5WeJPnJdC1jKaqZc_NVt1LdL4O-h4LDkavvGrbE3f3K6CfVqGatVLDK8pJNOyQApVmkGn9HMFnS6-GokOr9dW0MNqBHePsAA7ITyEQLN62CHJC1oTY7yaRrn5vtm2Ycm0QEXNgHug', 'Да', 'комплект', '/catalog/gorizont', 'product', 'gorizont', 'granite', 'modern', 'single', 'ГРАНИТ / МИНИМАЛИЗМ', '110×55×8 см', 'Матовая обработка', 'granite-monuments', True),
    ('Памятники', 'KK-1001', 'Памятник «Вечность I»', 'Мрамор Koelga', 'Премиальный памятник из мрамора Koelga.', 240000, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBypOaS_zJW7H4_VkRqtpUm1198vn5Wk566OiJAJcZHLCQ01eY4QzxNkcZ4dxmZ4UwbTlCRrRFe8LmXRq18mWHtOaTwFyZbPtI0JtUOWXjItG-jQJT_EMeTBXcXjycxZ-_-nk54fprOzKXybuKjOtR1tp9JA9GJk16Pk43PcvIK52A7DKgmgDt2imGgevrA07Vjwz3eh6fT9EfLajw2oZ2Do9e3ceI3NWa9LdZbIOyOoduUnn64TzQqzmzTZiaYBPum6A4MBreV8CQ', 'Да', 'комплект', '/catalog/vechnost-i', 'product', 'vechnost-i', 'marble', 'classic', 'single', 'МРАМОР КОЕЛГА', '120×60×10 см', 'Зеркальная полировка', 'marble-monuments', True),
    ('Памятники', 'KK-9042', 'Монумент «Сила»', 'Габбро-диабаз', 'Монумент из габбро-диабаза.', 185000, DEFAULT_IMAGE, 'Нет', 'комплект', '/catalog/sila', 'product', 'sila', 'gabbro', 'author', 'single', 'ГАББРО-ДИАБАЗ', '120×60×10 см', 'Зеркальная полировка', 'granite-monuments', True),
    ('Памятники', 'KK-1006', 'Памятник «Зенит»', 'Лабрадорит', 'Памятник из лабрадорита.', 215000, DEFAULT_IMAGE, 'Нет', 'комплект', '/catalog/zenit', 'product', 'zenit', 'labradorite', 'modern', 'single', 'ЛАБРАДОРИТ', '100×50×8 см', 'Минимализм', 'granite-monuments', False),
    ('Памятники', 'KK-2003', 'Памятник с портретом', 'С гравировкой', 'Гранит с художественной гравировкой портрета.', 78000, DEFAULT_IMAGE, 'Да', 'комплект', '/catalog/s-portretom', 'product', 's-portretom', 'granite', 'classic', 'single', 'ГРАНИТ / С ПОРТРЕТОМ', '100×50×8 см', 'Гравировка', 'granite-monuments', True),
    ('Памятники', 'KK-1128', 'Портрет «Вечность»', 'Авторский мрамор', 'Белый мрамор, портретная гравировка.', 420000, DEFAULT_IMAGE, 'Да', 'комплект', '/catalog/vechnost-portrait', 'product', 'vechnost-portrait', 'marble', 'author', 'single', 'БЕЛЫЙ МРАМОР', '100×50×8 см', 'Художественная гравировка', 'marble-monuments', True),
    ('Памятники', 'KK-1008', 'Памятник «Авангард»', 'Авторский гранит', 'Авторский дизайн из гранита.', 290000, DEFAULT_IMAGE, 'Нет', 'комплект', '/catalog/avangard', 'product', 'avangard', 'granite', 'author', 'single', 'ГРАНИТ / АВТОРСКИЕ', '120×70×10 см', 'Авторский дизайн', 'granite-monuments', False),
    ('Памятники', 'KK-1004', 'Стела «Ода»', 'Авторская стела', 'Стела из габбро с глубокой гравировкой.', 310000, DEFAULT_IMAGE, 'Нет', 'комплект', '/catalog/stela-oda', 'product', 'stela-oda', 'gabbro', 'author', 'single', 'ГАББРО / АВТОРСКИЕ', '130×65×12 см', 'Глубокая гравировка', 'granite-monuments', False),

    ('Памятники двойные', 'KK-1005', 'Памятник «Дуэт»', 'Двойной', 'Двойной памятник для семейного захоронения.', 450000, DEFAULT_IMAGE, 'Да', 'комплект', '/catalog/duet', 'product', 'duet', 'granite', 'classic', 'double', 'ГРАНИТ + МРАМОР', '160×80×12 см', 'Комбинированная отделка', 'granite-monuments', True),
    ('Памятники СВО', 'KK-1009', 'Памятник «Честь»', 'СВО', 'Памятник участнику СВО из габбро.', 160000, DEFAULT_IMAGE, 'Да', 'комплект', '/catalog/chest', 'product', 'chest', 'gabbro', 'classic', 'svo', 'ГАББРО / СВО', '100×50×8 см', 'Воинская символика', 'svo-monuments', True),
    ('Памятники СВО', 'KK-2010', 'Памятник СВО «Защитник»', 'СВО стандарт', 'Стела СВО с гравировкой эмблемы.', 145000, DEFAULT_IMAGE, 'Нет', 'комплект', '/catalog/zashchitnik-svo', 'product', 'zashchitnik-svo', 'gabbro', 'classic', 'svo', 'ГАББРО / СВО', '100×50×8 см', 'Гравировка эмблемы', 'svo-monuments', False),

    ('Комплексы', 'KK-1007', 'Комплекс «Колонна II»', 'Элитный', 'Мраморный мемориальный комплекс.', 520000, DEFAULT_IMAGE, 'Да', 'комплект', '/catalog/kolonna-ii', 'product', 'kolonna-ii', 'marble', 'classic', 'complex', 'МРАМОР / КОМПЛЕКС', '180×90×15 см', 'Классическая резьба', 'complexes', False),
    ('Комплексы', 'KK-2011', 'Семейный комплекс «Гранит»', 'Семейный', 'Комплекс: стела, подставка, цветник, ограда.', 380000, DEFAULT_IMAGE, 'Нет', 'комплект', '/catalog/semeinyi-granit', 'product', 'semeinyi-granit', 'granite', 'classic', 'complex', 'ГРАНИТ / КОМПЛЕКС', '200×100×12 см', 'Полный комплект', 'complexes', False),

    ('Ограды', 'KK-3001', 'Ограда гранитная стандарт', '2×1 м', 'Гранитная ограда стандартного размера.', 28000, DEFAULT_IMAGE, 'Нет', 'комплект', '/catalog/ograda-standart', 'product', 'ograda-standart', 'granite', 'classic', 'complex', 'ГРАНИТ / ОГРАДА', '200×100 см', 'Полировка', 'fences', False),
    ('Ограды', 'KK-3002', 'Ограда гранитная усиленная', '2,5×1,2 м', 'Усиленная гранитная ограда.', 42000, DEFAULT_IMAGE, 'Нет', 'комплект', '/catalog/ograda-usilennaya', 'product', 'ograda-usilennaya', 'granite', 'classic', 'complex', 'ГРАНИТ / ОГРАДА', '250×120 см', 'Усиленный профиль', 'fences', False),
    ('Лавочки', 'KK-3003', 'Лавочка гранитная', 'На могилу', 'Гранитная лавочка для посещения.', 22000, DEFAULT_IMAGE, 'Нет', 'шт', '/catalog/lavochka-granit', 'product', 'lavochka-granit', 'granite', 'classic', 'complex', 'ГРАНИТ / ЛАВОЧКА', '100×30×40 см', 'Полировка', 'benches', False),
    ('Вазоны', 'KK-3004', 'Ваза гранитная', 'На могилу', 'Декоративная гранитная ваза.', 15000, DEFAULT_IMAGE, 'Нет', 'шт', '/catalog/vaza-granit', 'product', 'vaza-granit', 'granite', 'classic', 'complex', 'ГРАНИТ / ВАЗА', '30×30×40 см', 'Полировка', 'vases', False),
]

CATEGORY_PRICE_FROM = {
    'granite-monuments': 'от 45 000 ₽',
    'marble-monuments': 'от 65 000 ₽',
    'svo-monuments': 'от 145 000 ₽',
    'elite-complexes': 'от 380 000 ₽',
    'complexes': 'от 380 000 ₽',
    'fences': 'от 28 000 ₽',
    'benches': 'от 22 000 ₽',
    'vases': 'от 15 000 ₽',
}

YANDEX_HEADERS = [
    'Категория',
    'Название',
    'Идентификатор',
    'Описание',
    'Короткое описание',
    'Цена',
    'Фото',
    'Популярный товар',
    'В наличии',
    'Количество',
    'Единицы измерения',
    'Ссылка',
]
