# Замена 3D-модели памятника в блоке Hero

На главной справа в первом экране крутится **процедурная 3D-сцена** (Three.js), а не загруженный `.glb`/`.gltf`.  
Тексты героя правятся в админке: **Страницы → home → блок «Герой»**.  
Сама модель — только в коде.

## Где лежит код

Файл:

`frontend/src/app/shared/monument-scene/monument-scene.component.ts`

Сцена создаётся в методах:

- `initScene()` — камера, свет, рендер
- `buildMonument()` (или аналогичный private-метод в том же файле) — геометрия стелы / постамента

После правок:

```bash
cd frontend
npm run build -- --configuration=production
```

На сервере достаточно обычного деплоя (`git pull` + build).

## Вариант A — подправить текущую модель

1. Откройте `monument-scene.component.ts`.
2. Найдите создание мешей (`BoxGeometry`, `CylinderGeometry`, материалы гранита).
3. Меняйте размеры, пропорции, цвет/текстуру.
4. Проверьте локально: `npm start` → главная → блок hero.

Требования к виду:

- читается на тёмном фоне героя;
- не перекрывает заголовок на мобиле (сцена уходит вниз сетки);
- FPS комфортный на телефоне (без тяжёлых карт нормалей 4K).

## Вариант B — своя модель GLB/GLTF (рекомендуется для «кастомной»)

### Требования к файлу

| Параметр | Рекомендация |
|----------|----------------|
| Формат | `.glb` (один файл) или `.gltf` + бинарник |
| Размер | до **3–5 МБ** (лучше < 2 МБ) |
| Полигоны | ориентир **20–80k** треугольников |
| Оси | модель стоит «на полу», центр у основания |
| Масштаб | ~1–2 м по высоте в единицах Three.js |
| Материалы | PBR (metalness/roughness), без огромных 8K-текстур |
| Анимация | не обязательна; лёгкое вращение делается в коде |

Положите файл, например:

`frontend/public/models/monument.glb`

(папка `public` копируется в корень сайта при сборке → URL `/models/monument.glb`).

### Что поменять в коде

1. Установите загрузчик (если ещё нет):

```bash
cd frontend
npm i three
# GLTFLoader уже входит в пакет three/examples
```

2. В `monument-scene.component.ts` вместо построения мешей вручную:

```ts
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// внутри initScene после lights:
const loader = new GLTFLoader();
loader.load('/models/monument.glb', (gltf) => {
  const model = gltf.scene;
  model.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });
  // подгонка:
  model.scale.setScalar(1); // подберите
  model.position.set(0, 0, 0);
  this.scene!.add(model);
  this.monument = model;
}, undefined, (err) => console.error('GLB load failed', err));
```

3. Уберите или закомментируйте старый `buildMonument()`, чтобы не было двух моделей.
4. В анимации (`animate`) вращайте `this.monument`, как сейчас крутится группа.

### Админка

В CMS **нельзя** загрузить GLB через текущее поле картинки блока.  
Нужен либо деплой файла в `public/models/`, либо отдельная доработка API media (по запросу).

## Вариант C — статичное фото вместо 3D

Если 3D не нужен:

1. В `home.component.html` замените `<app-monument-scene />` на `<img …>`.
2. URL картинки можно брать из CMS: `cms.text('home', 'hero', 'image_url')`.
3. Загрузите фото в админке у блока hero.

## Чек-лист перед продом

- [ ] Модель видна на desktop и mobile
- [ ] Нет ошибок в консоли браузера
- [ ] Страница главной грузится приемлемо на 4G
- [ ] SEO/og:image по-прежнему заданы (логотип или фото работы)
- [ ] Сделан commit + deploy
