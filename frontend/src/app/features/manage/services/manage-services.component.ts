import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExtraService } from '../../../core/models';
import { ManageApiService } from '../../../core/services/manage-api.service';

@Component({
  selector: 'app-manage-services',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './manage-services.component.html',
  styleUrl: './manage-services.component.scss',
})
export class ManageServicesComponent implements OnInit {
  private readonly api = inject(ManageApiService);
  readonly items = signal<ExtraService[]>([]);
  readonly message = signal('');
  readonly error = signal('');

  draft: Partial<ExtraService> = {
    slug: '',
    title: '',
    description: '',
    price: null,
    is_active: true,
    sort_order: 0,
  };

  editingId: number | null = null;

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.api.services().subscribe({
      next: (list) => this.items.set(list),
      error: () => this.error.set('Не удалось загрузить услуги'),
    });
  }

  edit(item: ExtraService): void {
    this.editingId = item.id;
    this.draft = { ...item };
  }

  cancel(): void {
    this.editingId = null;
    this.draft = {
      slug: '',
      title: '',
      description: '',
      price: null,
      is_active: true,
      sort_order: 0,
    };
  }

  save(): void {
    this.message.set('');
    this.error.set('');
    const payload = {
      slug: String(this.draft.slug || '').trim(),
      title: String(this.draft.title || '').trim(),
      description: String(this.draft.description || ''),
      price: this.draft.price == null || this.draft.price === ('' as unknown) ? null : Number(this.draft.price),
      is_active: !!this.draft.is_active,
      sort_order: Number(this.draft.sort_order) || 0,
    };

    const req = this.editingId
      ? this.api.updateService(this.editingId, payload)
      : this.api.createService(payload);

    req.subscribe({
      next: () => {
        this.message.set('Сохранено');
        this.cancel();
        this.reload();
      },
      error: () => this.error.set('Ошибка сохранения'),
    });
  }

  remove(item: ExtraService): void {
    if (!confirm(`Удалить «${item.title}»?`)) return;
    this.api.deleteService(item.id).subscribe({
      next: () => this.reload(),
      error: () => alert('Не удалось удалить'),
    });
  }
}
