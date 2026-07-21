import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  EventEmitter,
  inject,
} from '@angular/core';
import * as L from 'leaflet';
import { OfficeLocation } from '../../core/models';
import { MapService } from '../../core/services/map.service';

@Component({
  selector: 'app-regional-map',
  standalone: true,
  templateUrl: './regional-map.component.html',
  styleUrl: './regional-map.component.scss',
})
export class RegionalMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('mapHost') mapHost!: ElementRef<HTMLElement>;

  @Input() locations: OfficeLocation[] = [];
  @Input() compact = false;
  @Input() selectedId: number | null = null;
  @Input() startWithAll = false;
  @Input() mini = false;

  @Output() citySelect = new EventEmitter<OfficeLocation>();

  private readonly mapService = inject(MapService);
  private map?: L.Map;
  private markers = new Map<number, L.Marker>();
  private ready = false;
  private visibilityObserver?: IntersectionObserver;

  ngAfterViewInit(): void {
    this.ready = true;
    this.watchVisibility();
    if (this.locations.length) {
      this.initMap();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['locations'] && this.locations.length && this.ready) {
      if (this.map) {
        this.destroyMap();
      }
      this.initMap();
    }
    if (changes['selectedId'] && this.selectedId != null && this.map) {
      this.focusCity(this.selectedId);
    }
  }

  ngOnDestroy(): void {
    this.visibilityObserver?.disconnect();
    this.destroyMap();
  }

  private watchVisibility(): void {
    const host = this.mapHost?.nativeElement;
    if (!host) return;

    this.visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && this.map) {
          this.map.invalidateSize();
          setTimeout(() => this.map?.invalidateSize(), 200);
        }
      },
      { threshold: 0.15 }
    );
    this.visibilityObserver.observe(host);
  }

  private initMap(): void {
    if (!this.ready || !this.mapHost?.nativeElement || !this.locations.length || this.map) return;

    this.map = this.mapService.initRegionalMap({
      container: this.mapHost.nativeElement,
      compact: this.compact || this.mini,
      interactive: !this.mini,
    });

    this.markers = this.mapService.addLocations(this.map, this.locations, (loc) =>
      this.citySelect.emit(loc)
    );

    this.mapService.loadRegions(this.map).subscribe();

    if (this.selectedId != null) {
      this.focusCity(this.selectedId);
    } else if (this.startWithAll) {
      this.mapService.fitAllLocations(this.map, this.locations);
    } else {
      this.mapService.focusHeadquarters(this.map, this.locations);
    }
  }

  private focusCity(id: number): void {
    const loc = this.locations.find((l) => l.id === id);
    if (!loc || !this.map) return;
    this.mapService.flyTo(this.map, loc, 14);
    this.markers.get(id)?.openPopup();
  }

  showAllLocations(): void {
    if (!this.map) return;
    this.mapService.fitAllLocations(this.map, this.locations);
  }

  private destroyMap(): void {
    this.map?.remove();
    this.map = undefined;
    this.markers.clear();
  }
}
