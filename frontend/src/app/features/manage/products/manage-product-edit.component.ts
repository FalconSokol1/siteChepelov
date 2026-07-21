import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Category, ExtraService, Material, ProductType, Style } from '../../../core/models';
import { ManageApiService } from '../../../core/services/manage-api.service';
import { ManageGalleryFieldComponent } from '../shared/manage-gallery-field.component';
import { ManageMediaFieldComponent } from '../shared/manage-media-field.component';

@Component({
  selector: 'app-manage-product-edit',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    DecimalPipe,
    ManageMediaFieldComponent,
    ManageGalleryFieldComponent,
  ],
  templateUrl: './manage-product-edit.component.html',
  styleUrl: './manage-product-edit.component.scss',
})
export class ManageProductEditComponent implements OnInit {
  private readonly api = inject(ManageApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isNew = signal(true);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly message = signal('');
  readonly error = signal('');
  readonly categories = signal<Category[]>([]);
  readonly services = signal<ExtraService[]>([]);

  id: number | null = null;

  form = {
    sku: '',
    slug: '',
    name: '',
    material: 'granite' as Material,
    style: 'classic' as Style,
    product_type: 'single' as ProductType,
    material_label: '',
    price: 0,
    image_url: '',
    description: '',
    dimensions: '',
    finish: '',
    featured: false,
    category: null as number | null,
    gallery: [] as string[],
    extra_service_ids: [] as number[],
  };

  readonly materials: { value: Material; label: string }[] = [
    { value: 'granite', label: 'Гранит' },
    { value: 'marble', label: 'Мрамор' },
    { value: 'labradorite', label: 'Лабрадорит' },
    { value: 'gabbro', label: 'Габбро' },
  ];
  readonly styles: { value: Style; label: string }[] = [
    { value: 'classic', label: 'Классика' },
    { value: 'modern', label: 'Минимализм' },
    { value: 'author', label: 'Авторские' },
  ];
  readonly types: { value: ProductType; label: string }[] = [
    { value: 'single', label: 'Одиночные' },
    { value: 'double', label: 'Двойные' },
    { value: 'svo', label: 'СВО' },
    { value: 'complex', label: 'Комплексы' },
  ];

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.api.categories().subscribe({ next: (c) => this.categories.set(c) });
    this.api.services().subscribe({ next: (s) => this.services.set(s) });

    if (!idParam || idParam === 'new') {
      this.isNew.set(true);
      this.loading.set(false);
      return;
    }

    this.isNew.set(false);
    this.id = Number(idParam);
    this.api.product(this.id).subscribe({
      next: (p) => {
        this.form = {
          sku: p.sku,
          slug: p.slug,
          name: p.name,
          material: p.material,
          style: p.style,
          product_type: p.product_type,
          material_label: p.material_label,
          price: p.price,
          image_url: p.image_url,
          description: p.description || '',
          dimensions: p.dimensions || '',
          finish: p.finish || '',
          featured: p.featured,
          category: p.category,
          gallery: (p.images || []).map((i) => i.image_url).filter(Boolean),
          extra_service_ids: (p.extra_services || [])
            .map((s) => Number((s as { id: number | string }).id))
            .filter((n) => !Number.isNaN(n)),
        };
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Товар не найден');
        this.loading.set(false);
      },
    });
  }

  toggleService(id: number, checked: boolean): void {
    if (checked) {
      this.form.extra_service_ids = [...this.form.extra_service_ids, id];
    } else {
      this.form.extra_service_ids = this.form.extra_service_ids.filter((x) => x !== id);
    }
  }

  onNameBlur(): void {
    if (!this.form.slug && this.form.name) {
      this.form.slug = this.slugify(this.form.name);
    }
    if (!this.form.sku && this.form.name) {
      this.form.sku = this.slugify(this.form.name).slice(0, 20).toUpperCase();
    }
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[а-яё]/gi, (ch) => {
        const map: Record<string, string> = {
          а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh',
          з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
          п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts',
          ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
        };
        return map[ch.toLowerCase()] ?? '';
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  save(): void {
    this.message.set('');
    this.error.set('');
    this.saving.set(true);

    const image_urls = this.form.gallery.map((s) => s.trim()).filter(Boolean);
    const main = this.form.image_url.trim() || image_urls[0] || '';

    const payload = {
      sku: this.form.sku.trim(),
      slug: this.form.slug.trim(),
      name: this.form.name.trim(),
      material: this.form.material,
      style: this.form.style,
      product_type: this.form.product_type,
      material_label: this.form.material_label.trim(),
      price: Number(this.form.price) || 0,
      image_url: main,
      description: this.form.description,
      dimensions: this.form.dimensions,
      finish: this.form.finish,
      featured: this.form.featured,
      category: this.form.category,
      image_urls,
      extra_service_ids: this.form.extra_service_ids,
    };

    const req = this.isNew()
      ? this.api.createProduct(payload)
      : this.api.updateProduct(this.id!, payload);

    req.subscribe({
      next: (p) => {
        this.saving.set(false);
        this.message.set('Сохранено');
        if (this.isNew()) {
          void this.router.navigate(['/manage/products', p.id]);
        }
      },
      error: (err) => {
        this.saving.set(false);
        const detail = err?.error;
        this.error.set(
          typeof detail === 'object'
            ? Object.values(detail).flat().join(' ')
            : 'Ошибка сохранения'
        );
      },
    });
  }
}
