import { Component, input, signal } from '@angular/core';

export interface TrustBookletItem {
  icon: string;
  title: string;
  desc: string;
}

@Component({
  selector: 'app-trust-booklet',
  standalone: true,
  templateUrl: './trust-booklet.component.html',
  styleUrl: './trust-booklet.component.scss',
})
export class TrustBookletComponent {
  readonly items = input.required<TrustBookletItem[]>();
  readonly open = signal(false);

  openBook(): void {
    if (!this.open()) {
      this.open.set(true);
    }
  }

  closeBook(): void {
    if (this.open()) {
      this.open.set(false);
    }
  }
}
