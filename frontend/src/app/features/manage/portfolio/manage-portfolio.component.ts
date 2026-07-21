import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortfolioItem } from '../../../core/models';
import { ManageApiService } from '../../../core/services/manage-api.service';
import { ManageMediaFieldComponent } from '../shared/manage-media-field.component';

@Component({
  selector: 'app-manage-portfolio',
  standalone: true,
  imports: [FormsModule, ManageMediaFieldComponent],
  templateUrl: './manage-portfolio.component.html',
  styleUrl: './manage-portfolio.component.scss',
})
export class ManagePortfolioComponent implements OnInit {
  private readonly api = inject(ManageApiService);
  readonly items = signal<PortfolioItem[]>([]);
  readonly message = signal('');
  readonly error = signal('');
  editingId: number | null = null;

  draft: Partial<PortfolioItem> = {
    title: '',
    material: '',
    city: '',
    image_url: '',
    sort_order: 0,
  };

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.api.portfolio().subscribe({
      next: (list) => this.items.set(list),
      error: () => this.error.set('Не удалось загрузить портфолио'),
    });
  }

  edit(item: PortfolioItem): void {
    this.editingId = item.id;
    this.draft = { ...item };
  }

  cancel(): void {
    this.editingId = null;
    this.draft = { title: '', material: '', city: '', image_url: '', sort_order: 0 };
  }

  save(): void {
    this.message.set('');
    const payload = {
      title: String(this.draft.title || '').trim(),
      material: String(this.draft.material || '').trim(),
      city: String(this.draft.city || '').trim(),
      image_url: String(this.draft.image_url || '').trim(),
      sort_order: Number(this.draft.sort_order) || 0,
    };
    const req = this.editingId
      ? this.api.updatePortfolio(this.editingId, payload)
      : this.api.createPortfolio(payload);
    req.subscribe({
      next: () => {
        this.message.set('Сохранено');
        this.cancel();
        this.reload();
      },
      error: () => this.error.set('Ошибка сохранения'),
    });
  }

  remove(item: PortfolioItem): void {
    if (!confirm(`Удалить «${item.title}»?`)) return;
    this.api.deletePortfolio(item.id).subscribe({ next: () => this.reload() });
  }
}
