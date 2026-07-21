import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category } from '../../../core/models';
import { ManageApiService } from '../../../core/services/manage-api.service';
import { ManageMediaFieldComponent } from '../shared/manage-media-field.component';

@Component({
  selector: 'app-manage-categories',
  standalone: true,
  imports: [FormsModule, ManageMediaFieldComponent],
  templateUrl: './manage-categories.component.html',
  styleUrl: './manage-categories.component.scss',
})
export class ManageCategoriesComponent implements OnInit {
  private readonly api = inject(ManageApiService);
  readonly items = signal<Category[]>([]);
  readonly message = signal('');
  readonly error = signal('');
  editingId: number | null = null;

  draft: Partial<Category> = this.empty();

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.api.categories().subscribe({
      next: (items) => this.items.set(items),
      error: () => this.error.set('Не удалось загрузить категории'),
    });
  }

  edit(item: Category): void {
    this.editingId = item.id;
    this.draft = { ...item };
  }

  cancel(): void {
    this.editingId = null;
    this.draft = this.empty();
  }

  save(): void {
    this.message.set('');
    this.error.set('');
    const request = this.editingId
      ? this.api.updateCategory(this.editingId, this.draft)
      : this.api.createCategory(this.draft);
    request.subscribe({
      next: () => {
        this.message.set('Категория сохранена');
        this.cancel();
        this.reload();
      },
      error: () => this.error.set('Проверьте обязательные поля и уникальность кода'),
    });
  }

  remove(item: Category): void {
    if (!confirm(`Удалить категорию «${item.title}»? Товары останутся без категории.`)) return;
    this.api.deleteCategory(item.id).subscribe({
      next: () => this.reload(),
      error: () => this.error.set('Не удалось удалить категорию'),
    });
  }

  private empty(): Partial<Category> {
    return {
      slug: '',
      title: '',
      subtitle: '',
      image_url: '',
      price_from: '',
      sort_order: 0,
    };
  }
}
