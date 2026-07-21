import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ConsultationRequest } from '../../../core/models';
import { ManageApiService } from '../../../core/services/manage-api.service';

@Component({
  selector: 'app-manage-consultations',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './manage-consultations.component.html',
  styleUrl: './manage-consultations.component.scss',
})
export class ManageConsultationsComponent implements OnInit {
  private readonly api = inject(ManageApiService);
  readonly items = signal<ConsultationRequest[]>([]);
  readonly error = signal('');

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.api.consultations().subscribe({
      next: (list) => this.items.set(list),
      error: () => this.error.set('Не удалось загрузить заявки'),
    });
  }

  remove(item: ConsultationRequest): void {
    if (!item.id || !confirm(`Удалить заявку от ${item.name}?`)) return;
    this.api.deleteConsultation(item.id).subscribe({
      next: () => this.items.update((list) => list.filter((x) => x.id !== item.id)),
    });
  }
}
