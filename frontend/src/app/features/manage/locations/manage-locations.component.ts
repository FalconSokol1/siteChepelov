import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OfficeLocation } from '../../../core/models';
import { ManageApiService } from '../../../core/services/manage-api.service';

@Component({
  selector: 'app-manage-locations',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './manage-locations.component.html',
  styleUrl: './manage-locations.component.scss',
})
export class ManageLocationsComponent implements OnInit {
  private readonly api = inject(ManageApiService);
  readonly items = signal<OfficeLocation[]>([]);
  readonly message = signal('');
  readonly error = signal('');
  selected: OfficeLocation | null = null;

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.api.locations().subscribe({
      next: (list) => {
        this.items.set(list);
        if (this.selected) {
          this.selected = list.find((x) => x.id === this.selected!.id) || list[0] || null;
        } else {
          this.selected = list[0] || null;
        }
      },
      error: () => this.error.set('Не удалось загрузить адреса'),
    });
  }

  select(item: OfficeLocation): void {
    this.selected = { ...item };
  }

  save(): void {
    if (!this.selected) return;
    this.message.set('');
    this.api.updateLocation(this.selected.id, this.selected).subscribe({
      next: () => {
        this.message.set('Адрес сохранён');
        this.reload();
      },
      error: () => this.error.set('Ошибка сохранения'),
    });
  }
}
