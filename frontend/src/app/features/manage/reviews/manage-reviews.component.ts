import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Review } from '../../../core/models';
import { ManageApiService } from '../../../core/services/manage-api.service';

@Component({
  selector: 'app-manage-reviews',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './manage-reviews.component.html',
  styleUrl: './manage-reviews.component.scss',
})
export class ManageReviewsComponent implements OnInit {
  private readonly api = inject(ManageApiService);
  readonly items = signal<Review[]>([]);
  readonly error = signal('');

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.api.reviews().subscribe({
      next: (items) => this.items.set(items),
      error: () => this.error.set('Не удалось загрузить отзывы'),
    });
  }

  remove(item: Review): void {
    if (!confirm(`Удалить отзыв от ${item.author}?`)) return;
    this.api.deleteReview(item.id).subscribe({
      next: () => this.items.update((items) => items.filter((value) => value.id !== item.id)),
      error: () => this.error.set('Не удалось удалить отзыв'),
    });
  }
}
