import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import * as L from 'leaflet';
import { Observable, catchError, of, tap } from 'rxjs';
import { OfficeLocation } from '../models';

export interface MapInitOptions {
  container: HTMLElement;
  compact?: boolean;
  interactive?: boolean;
}

export const REGION_BOUNDS: L.LatLngBoundsExpression = [
  [43.45, 36.5],
  [46.25, 41.55],
];

/** Кастомная подложка: Esri World Street Map (без OSM/Carto атрибуции) */
const KK_STREET_TILES =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
const KK_STREET_FALLBACK =
  'https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
const OSM_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const REGION_CENTER: L.LatLngExpression = [44.72, 39.35];

@Injectable({ providedIn: 'root' })
export class MapService {
  private readonly http = inject(HttpClient);
  private regionLayer?: L.GeoJSON;

  initRegionalMap(options: MapInitOptions): L.Map {
    const { container, compact = false, interactive = true } = options;

    const map = L.map(container, {
      center: REGION_CENTER,
      zoom: compact ? 9 : 10,
      minZoom: 7,
      maxZoom: 18,
      maxBounds: REGION_BOUNDS,
      maxBoundsViscosity: 0.85,
      zoomControl: false,
      attributionControl: false,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive,
    });

    this.addBaseTiles(map);

    if (!compact) {
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.control.scale({ imperial: false, metric: true, position: 'bottomleft' }).addTo(map);
    } else if (!interactive) {
      // mini-map: no controls
    } else {
      L.control.zoom({ position: 'bottomright' }).addTo(map);
    }

    requestAnimationFrame(() => map.invalidateSize());
    setTimeout(() => map.invalidateSize(), 250);
    setTimeout(() => map.invalidateSize(), 900);
    return map;
  }

  private addBaseTiles(map: L.Map): void {
    const primary = L.tileLayer(KK_STREET_TILES, {
      maxZoom: 18,
      attribution: '',
    });

    const fallback = L.tileLayer(KK_STREET_FALLBACK, {
      maxZoom: 18,
      attribution: '',
    });

    const osm = L.tileLayer(OSM_TILES, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    });

    primary.addTo(map);

    let errors = 0;
    primary.on('tileerror', () => {
      errors += 1;
      if (errors === 3) {
        map.removeLayer(primary);
        fallback.addTo(map);
      } else if (errors === 8) {
        map.eachLayer((layer) => {
          if (layer instanceof L.TileLayer) map.removeLayer(layer);
        });
        osm.addTo(map);
      }
    });
  }

  loadRegions(map: L.Map): Observable<GeoJSON.FeatureCollection> {
    return this.http.get<GeoJSON.FeatureCollection>('geo/regions.json').pipe(
      tap((geo) => this.drawRegions(map, geo)),
      catchError(() => {
        this.drawRegions(map, { type: 'FeatureCollection' as const, features: [] });
        return of({ type: 'FeatureCollection' as const, features: [] });
      })
    );
  }

  private drawRegions(map: L.Map, geo: GeoJSON.FeatureCollection): void {
    if (this.regionLayer) map.removeLayer(this.regionLayer);

    this.regionLayer = L.geoJSON(geo, {
      interactive: false,
      style: (feature) => {
        const isAdygea = feature?.properties?.['id'] === 'adygea';
        return {
          color: isAdygea ? '#6E1118' : '#B79A72',
          weight: isAdygea ? 2.5 : 2,
          opacity: 0.95,
          fillColor: isAdygea ? '#6E1118' : '#B79A72',
          fillOpacity: isAdygea ? 0.14 : 0.09,
          dashArray: isAdygea ? undefined : '8 6',
        };
      },
      onEachFeature: (feature, layer) => {
        const name = String(feature.properties?.['name'] ?? '');
        if (!name) return;
        layer.bindTooltip(name, {
          permanent: true,
          direction: 'center',
          className: 'kk-region-tooltip',
        });
      },
    }).addTo(map);

    this.regionLayer.bringToBack();
  }

  addLocations(
    map: L.Map,
    locations: OfficeLocation[],
    onSelect?: (loc: OfficeLocation) => void
  ): Map<number, L.Marker> {
    const markers = new Map<number, L.Marker>();
    locations.forEach((loc) => {
      const marker = this.createMarker(loc);
      marker.addTo(map);
      marker.bindPopup(this.buildPopup(loc), { className: 'kk-popup', maxWidth: 280 });
      marker.bindTooltip(loc.city, {
        permanent: true,
        direction: 'top',
        offset: [0, -42],
        className: 'kk-city-tooltip',
      });
      marker.on('click', () => onSelect?.(loc));
      markers.set(loc.id, marker);
    });
    return markers;
  }

  focusHeadquarters(map: L.Map, locations: OfficeLocation[]): void {
    const hq = locations.find((l) => l.is_headquarters) ?? locations[0];
    if (!hq) return;
    map.setView([hq.latitude, hq.longitude], 13, { animate: false });
  }

  fitAllLocations(map: L.Map, locations: OfficeLocation[]): void {
    if (!locations.length) return;
    const bounds = L.latLngBounds(
      locations.map((l) => [l.latitude, l.longitude] as L.LatLngTuple)
    );
    map.fitBounds(bounds, {
      padding: [52, 52],
      maxZoom: 10,
      animate: false,
    });
  }

  flyTo(map: L.Map, location: OfficeLocation, zoom = 14): void {
    map.flyTo([location.latitude, location.longitude], zoom, { duration: 1.1 });
  }

  createMarker(loc: OfficeLocation): L.Marker {
    let variant = 'default';
    if (loc.is_headquarters) variant = 'hq';
    else if (loc.is_highlighted) variant = 'highlight';
    else if (loc.region === 'adygea') variant = 'adygea';

    const icon = L.divIcon({
      className: 'kk-pin-wrap',
      html: `
        <div class="kk-pin kk-pin--${variant}" aria-hidden="true">
          <svg viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 8.25 12 24 12 24s12-15.75 12-24C24 5.373 18.627 0 12 0z" fill="currentColor"/>
            <circle cx="12" cy="11.5" r="4.5" fill="#fff"/>
          </svg>
        </div>
      `,
      iconSize: variant === 'hq' ? [34, 44] : [28, 36],
      iconAnchor: variant === 'hq' ? [17, 44] : [14, 36],
    });
    return L.marker([loc.latitude, loc.longitude], { icon });
  }

  buildPopup(loc: OfficeLocation): string {
    const regionLabel =
      loc.region === 'adygea'
        ? 'Республика Адыгея'
        : loc.region === 'krasnodar_krai'
          ? 'Краснодарский край'
          : 'Россия';
    return `
      <div class="kk-popup__inner">
        <strong>${loc.city}</strong>
        ${loc.is_headquarters ? '<span class="kk-popup__badge">Головной офис</span>' : ''}
        ${loc.is_highlighted ? '<span class="kk-popup__badge">Ключевой город</span>' : ''}
        <p>${loc.address}</p>
        <p class="kk-popup__desc">${regionLabel} · ${loc.description}</p>
        ${loc.phone ? `<a href="tel:${loc.phone.replace(/\s/g, '')}">${loc.phone}</a>` : ''}
      </div>
    `;
  }
}