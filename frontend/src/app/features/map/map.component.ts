import { Component, OnInit, inject, signal } from '@angular/core';
import { OfficeLocation } from '../../core/models';
import { ApiService } from '../../core/services/api.service';
import { CmsContentService } from '../../core/services/cms-content.service';
import { SeoService } from '../../core/services/seo.service';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { RegionalMapComponent } from '../../shared/regional-map/regional-map.component';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, RegionalMapComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly seo = inject(SeoService);
  readonly cms = inject(CmsContentService);

  readonly locations = signal<OfficeLocation[]>([]);
  readonly selectedId = signal<number | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.cms.load('map').subscribe();
    this.seo.update({
      title: 'Офис и карта — КавказКамень',
      description: 'Офис КавказКамень в пос. Родники, ул. Лесная, 70. Консультации и приём заказов.',
      url: '/map',
    });
    this.api.getLocations().subscribe({
      next: (data) => {
        this.locations.set(data);
        const office = data.find((l) => l.is_headquarters) ?? data[0];
        if (office) this.selectedId.set(office.id);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  selectCity(loc: OfficeLocation): void {
    this.selectedId.set(loc.id);
  }

  activeLocation(): OfficeLocation | undefined {
    const id = this.selectedId();
    if (id == null) return this.locations()[0];
    return this.locations().find((l) => l.id === id) ?? this.locations()[0];
  }

  phoneHref(phone: string): string {
    return 'tel:' + phone.replace(/\s/g, '');
  }

  mapsRouteUrl(loc: OfficeLocation): string {
    const query = encodeURIComponent(`${loc.city}, ${loc.address}`);
    return `https://yandex.ru/maps/?text=${query}`;
  }
}
