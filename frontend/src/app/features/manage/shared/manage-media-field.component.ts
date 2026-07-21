import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ManageApiService } from '../../../core/services/manage-api.service';

@Component({
  selector: 'app-manage-media-field',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './manage-media-field.component.html',
  styleUrl: './manage-media-field.component.scss',
})
export class ManageMediaFieldComponent {
  private readonly api = inject(ManageApiService);

  @Input() label = 'Фото';
  @Input() hint = '';
  @Input() placeholder = 'Горизонтальное фото памятника';
  /** tall | wide | square */
  @Input() ratio: 'tall' | 'wide' | 'square' = 'wide';
  @Input() set value(v: string | null | undefined) {
    this._value = (v || '').trim() ? String(v) : '';
  }
  get value(): string {
    return this._value;
  }
  private _value = '';
  @Output() valueChange = new EventEmitter<string>();

  readonly uploading = signal(false);
  readonly error = signal('');
  readonly broken = signal(false);
  showUrl = false;

  onUrl(v: string): void {
    this.broken.set(false);
    this.valueChange.emit(v.trim());
  }

  clear(): void {
    this.error.set('');
    this.broken.set(false);
    this.valueChange.emit('');
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error.set('Нужен файл изображения (JPEG, PNG, WebP)');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      this.error.set('Файл больше 8 МБ — сожмите фото');
      return;
    }

    this.error.set('');
    this.uploading.set(true);
    this.api.uploadImage(file).subscribe({
      next: (res) => {
        this.uploading.set(false);
        this.broken.set(false);
        this.valueChange.emit(res.url);
      },
      error: (err) => {
        this.uploading.set(false);
        this.error.set(err?.error?.detail || 'Не удалось загрузить фото');
      },
    });
  }

  onImgError(): void {
    this.broken.set(true);
  }

  onImgLoad(): void {
    this.broken.set(false);
  }
}
