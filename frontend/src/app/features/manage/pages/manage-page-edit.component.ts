import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { ContentBlock, SitePage } from '../../../core/models';
import { ManageApiService } from '../../../core/services/manage-api.service';
import { ManageMediaFieldComponent } from '../shared/manage-media-field.component';

const BLOCK_META: Record<string, { title: string; hint: string; imageHint?: string }> = {
  hero: {
    title: 'Герой (первый экран)',
    hint: 'Крупный заголовок и кнопка на главной. Картинка — фон или фото справа/на весь экран.',
    imageHint: 'Широкое атмосферное фото камня или готовой работы, 1600×900 и больше',
  },
  categories: {
    title: 'Категории на главной',
    hint: 'Подписи секции с категориями. Сами карточки категорий — в разделе «Категории».',
  },
  featured: {
    title: 'Избранные товары',
    hint: 'Заголовок блока «популярные» на главной. Какие товары показывать — галочка «на главной» у товара.',
  },
  svo: {
    title: 'Блок СВО',
    hint: 'Отдельная секция про памятники СВО.',
    imageHint: 'Фото памятника СВО или символики, горизонтальный кадр',
  },
  company: {
    title: 'О компании',
    hint: 'Текст «кто мы» на главной.',
    imageHint: 'Фото мастерской, склада или процесса работы',
  },
  portfolio: {
    title: 'Портфолио на главной',
    hint: 'Подписи секции. Сами работы — в разделе «Портфолио».',
  },
  reviews: {
    title: 'Отзывы на главной',
    hint: 'Заголовок секции отзывов.',
  },
  cta: {
    title: 'Призыв к действию',
    hint: 'Нижний баннер с кнопкой «оставить заявку».',
  },
  intro: {
    title: 'Вступление страницы',
    hint: 'Текст вверху страницы (каталог, карта, отзывы и т.д.).',
  },
  seo: {
    title: 'SEO-текст',
    hint: 'Дополнительный текст для поисковиков внизу страницы.',
  },
  contacts: {
    title: 'Контакты',
    hint: 'Телефон, адрес и подписи в шапке/подвале (страница «Общие настройки»).',
  },
  footer: {
    title: 'Подвал',
    hint: 'Тексты и ссылки внизу сайта.',
  },
  header: {
    title: 'Шапка сайта',
    hint: 'Подписи меню и общие фразы в шапке.',
  },
};

@Component({
  selector: 'app-manage-page-edit',
  standalone: true,
  imports: [FormsModule, RouterLink, ManageMediaFieldComponent],
  templateUrl: './manage-page-edit.component.html',
  styleUrl: './manage-page-edit.component.scss',
})
export class ManagePageEditComponent implements OnInit {
  private readonly api = inject(ManageApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly message = signal('');
  readonly error = signal('');
  readonly isNew = signal(false);
  slug = '';

  page: SitePage = {
    slug: '',
    title: '',
    meta_title: '',
    meta_description: '',
    is_published: true,
    blocks: [],
    updated_at: '',
  };

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') || '';
    if (this.slug === 'new') {
      this.isNew.set(true);
      this.slug = '';
      this.loading.set(false);
      return;
    }
    this.api.page(this.slug).subscribe({
      next: (p) => {
        this.page = {
          ...p,
          blocks: (p.blocks || []).map((b) => ({ ...b })),
        };
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Страница не найдена');
        this.loading.set(false);
      },
    });
  }

  addBlock(): void {
    const n = this.page.blocks.length + 1;
    this.page.blocks = [
      ...this.page.blocks,
      {
        key: `block-${n}`,
        title: '',
        body: '',
        image_url: '',
        button_label: '',
        button_url: '',
        extra_data: {},
        is_enabled: true,
        sort_order: n,
      },
    ];
  }

  removeBlock(index: number): void {
    this.page.blocks = this.page.blocks.filter((_, i) => i !== index);
  }

  moveBlock(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= this.page.blocks.length) return;
    const blocks = [...this.page.blocks];
    [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
    this.page.blocks = blocks;
  }

  extraEntries(block: ContentBlock): [string, unknown][] {
    return Object.entries(block.extra_data || {});
  }

  addExtra(block: ContentBlock): void {
    let index = 1;
    let key = `field_${index}`;
    while (key in block.extra_data) {
      key = `field_${++index}`;
    }
    block.extra_data = { ...block.extra_data, [key]: '' };
  }

  renameExtra(block: ContentBlock, oldKey: string, newKey: string): void {
    const cleaned = newKey.trim().replace(/\s+/g, '_');
    if (!cleaned || cleaned === oldKey) return;
    const entries = Object.entries(block.extra_data).map(([key, value]) =>
      key === oldKey ? [cleaned, value] : [key, value]
    );
    block.extra_data = Object.fromEntries(entries);
  }

  setExtra(block: ContentBlock, key: string, value: string): void {
    block.extra_data = { ...block.extra_data, [key]: value };
  }

  removeExtra(block: ContentBlock, key: string): void {
    const data = { ...block.extra_data };
    delete data[key];
    block.extra_data = data;
  }

  save(): void {
    this.message.set('');
    this.error.set('');
    this.saving.set(true);
    const payload = {
      slug: this.page.slug || this.slug,
      title: this.page.title,
      meta_title: this.page.meta_title,
      meta_description: this.page.meta_description,
      is_published: this.page.is_published,
      blocks: this.page.blocks.map((b, i) => ({
        ...b,
        sort_order: i,
      })),
    };
    const request = this.isNew()
      ? this.api.createPage(payload)
      : this.api.updatePage(this.slug, payload);

    request
      .subscribe({
        next: (p) => {
          this.page = { ...p, blocks: (p.blocks || []).map((b) => ({ ...b })) };
          this.slug = p.slug;
          this.saving.set(false);
          this.message.set('Страница сохранена — проверьте сайт');
          if (this.isNew()) {
            this.isNew.set(false);
            void this.router.navigate(['/manage/pages', p.slug], { replaceUrl: true });
          }
        },
        error: () => {
          this.saving.set(false);
          this.error.set('Ошибка сохранения');
        },
      });
  }

  trackBlock(_i: number, b: ContentBlock): string {
    return String(b.id ?? b.key);
  }

  blockTitle(block: ContentBlock, index: number): string {
    const meta = BLOCK_META[block.key];
    if (meta) return meta.title;
    if (block.title?.trim()) return block.title.trim();
    return `Блок ${index + 1}`;
  }

  blockHint(block: ContentBlock): string {
    return BLOCK_META[block.key]?.hint || 'Тексты и картинка этого блока на сайте.';
  }

  blockImageHint(block: ContentBlock): string {
    return (
      BLOCK_META[block.key]?.imageHint ||
      'Загрузите фото, которое должно быть в этом блоке на сайте'
    );
  }

  needsImage(block: ContentBlock): boolean {
    const key = block.key;
    if (BLOCK_META[key]?.imageHint) return true;
    return Boolean(block.image_url);
  }
}
