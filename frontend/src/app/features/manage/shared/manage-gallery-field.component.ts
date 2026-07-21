import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ManageApiService } from '../../../core/services/manage-api.service';

@Component({
  selector: 'app-manage-gallery-field',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './manage-gallery-field.component.html',
  styleUrl: './manage-gallery-field.component.scss',
})
export class ManageGalleryFieldComponent {
  private readonly api = inject(ManageApiService);

  @Input() label = 'Галерея';
  @Input() hint = 'Дополнительные ракурсы товара. Первое фото можно сделать главным.';
  @Input() urls: string[] = [];
  @Output() urlsChange = new EventEmitter<string[]>();

  readonly uploading = signal(false);
  readonly error = signal('');
  draftUrl = '';

  private emit(next: string[]): void {
    this.urlsChange.emit(next);
  }

  onFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    input.value = '';
    if (!files.length) return;

    this.error.set('');
    this.uploading.set(true);

    const uploadOne = (file: File) =>
      new Promise<string>((resolve, reject) => {
        this.api.uploadImage(file).subscribe({
          next: (r) => resolve(r.url),
          error: (e) => reject(e),
        });
      });

    Promise.all(files.map(uploadOne))
      .then((added) => {
        this.uploading.set(false);
        this.emit([...this.urls, ...added]);
      })
      .catch((err) => {
        this.uploading.set(false);
        this.error.set(err?.error?.detail || 'Не удалось загрузить одно из фото');
      });
  }

  addUrl(): void {
    const url = this.draftUrl.trim();
    if (!url) return;
    this.draftUrl = '';
    this.emit([...this.urls, url]);
  }

  remove(index: number): void {
    this.emit(this.urls.filter((_, i) => i !== index));
  }

  move(index: number, delta: number): void {
    const next = [...this.urls];
    const j = index + delta;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    this.emit(next);
  }

  setAsMain(index: number): void {
    if (index <= 0) return;
    const next = [...this.urls];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    this.emit(next);
  }

  updateAt(index: number, value: string): void {
    const next = [...this.urls];
    next[index] = value.trim();
    this.emit(next);
  }
}
