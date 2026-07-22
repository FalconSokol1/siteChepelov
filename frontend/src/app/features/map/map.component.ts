import { Component, OnInit, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { OfficeLocation } from '../../core/models';
import { FALLBACK_LOCATIONS } from '../../core/data/fallback-content';
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

  readonly locations = signal<OfficeLocation[]>(FALLBACK_LOCATIONS);
  readonly selectedId = signal<number | null>(FALLBACK_LOCATIONS[0]?.id ?? null);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.cms.load('map').subscribe();
    this.seo.update({
      title: 'Офис и карта — КавказКамень',
      description: 'Офис КавказКамень в пос. Родники, ул. Лесная, 70. Консультации и приём заказов.',
      url: '/map',
    });
    this.api.getLocations().pipe(catchError(() => of(FALLBACK_LOCATIONS))).subscribe({
      next: (data) => {
        const list = data.length ? data : FALLBACK_LOCATIONS;
        this.locations.set(list);
        const office = list.find((l) => l.is_headquarters) ?? list[0];
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
