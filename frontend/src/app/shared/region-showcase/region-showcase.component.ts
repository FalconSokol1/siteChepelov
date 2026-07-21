import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OfficeLocation } from '../../core/models';
import { CmsContentService } from '../../core/services/cms-content.service';
import { RegionalMapComponent } from '../regional-map/regional-map.component';

@Component({
  selector: 'app-region-showcase',
  standalone: true,
  imports: [RouterLink, RegionalMapComponent],
  templateUrl: './region-showcase.component.html',
  styleUrl: './region-showcase.component.scss',
})
export class RegionShowcaseComponent {
  readonly cms = inject(CmsContentService);
  readonly locations = input.required<OfficeLocation[]>();
  readonly selectedId = input<number | null>(null);
  readonly citySelect = output<OfficeLocation>();

  constructor() {
    this.cms.load('home').subscribe();
  }

  selectCity(loc: OfficeLocation): void {
    this.citySelect.emit(loc);
  }

  activeLocation(): OfficeLocation | undefined {
    const id = this.selectedId();
    if (id == null) return this.locations()[0];
    return this.locations().find((l) => l.id === id) ?? this.locations()[0];
  }

  regionLabel(loc: OfficeLocation): string {
    if (loc.region === 'adygea') return 'Республика Адыгея';
    if (loc.region === 'krasnodar_krai') return 'Краснодарский край';
    return 'Россия';
  }

  phoneHref(phone: string): string {
    return 'tel:' + phone.replace(/\s/g, '');
  }

  mapsRouteUrl(loc: OfficeLocation): string {
    const query = encodeURIComponent(`${loc.city}, ${loc.address}`);
    return `https://yandex.ru/maps/?text=${query}`;
  }
}
