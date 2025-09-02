import {
  Component,
  EventEmitter,
  Input,
  Output,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ComboSelectorComponent } from '../../../../components/shared/combo-selector/combo-selector.component';

declare const L: any;

@Component({
  selector: 'app-update-location-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ComboSelectorComponent],
  templateUrl: './update-location-modal.component.html',
  styleUrl: './update-location-modal.component.scss',
})
export class UpdateLocationModalComponent implements OnInit, AfterViewInit {
  @Input() locationData: any;
  @Input() projects: { id: string; name: { en: string; ar: string } }[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<{
    locationId: string;
    nameEn: string;
    nameAr: string;
    projectId?: string;
    latitude?: number;
    longitude?: number;
  }>();

  nameEn = '';
  nameAr = '';
  selectedProjectId = '';
  latitude?: number;
  longitude?: number;
  error = '';
  private mapInitialized = false;
  private mapInstance: any;
  private markerInstance: any;

  ngOnInit() {
    if (this.locationData) {
      // Pre-populate form with existing data
      if (typeof this.locationData.name === 'object') {
        this.nameEn = this.locationData.name.en || '';
        this.nameAr = this.locationData.name.ar || '';
      } else {
        this.nameEn = this.locationData.name || '';
        this.nameAr = '';
      }
      this.latitude = this.locationData.latitude;
      this.longitude = this.locationData.longitude;

      // Find the project ID based on the project name
      if (this.locationData.projectName && this.projects.length > 0) {
        const project = this.projects.find(
          (p) =>
            (typeof this.locationData.projectName === 'object' &&
              p.name.en === this.locationData.projectName.en) ||
            p.name.en === this.locationData.projectName
        );
        if (project) {
          this.selectedProjectId = project.id;
        }
      }
    }
  }

  async ngAfterViewInit() {
    await this.ensureLeafletLoaded();
    this.initializeMap();
  }

  private ensureLeafletLoaded(): Promise<void> {
    return new Promise((resolve) => {
      const isLoaded = typeof (window as any).L !== 'undefined';
      if (isLoaded) {
        resolve();
        return;
      }
      // inject CSS
      const leafletCssId = 'leaflet-css';
      if (!document.getElementById(leafletCssId)) {
        const link = document.createElement('link');
        link.id = leafletCssId;
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // inject JS
      const scriptId = 'leaflet-js';
      if (document.getElementById(scriptId)) {
        (
          document.getElementById(scriptId) as HTMLScriptElement
        ).addEventListener('load', () => resolve());
        return;
      }
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  }

  private initializeMap() {
    if (this.mapInitialized || typeof (window as any).L === 'undefined') return;
    this.mapInitialized = true;

    const defaultLat = this.latitude ?? 25.276987; // Dubai as default
    const defaultLng = this.longitude ?? 55.296249;

    this.mapInstance = (window as any).L.map(
      'update-location-picker-map'
    ).setView([defaultLat, defaultLng], 10);
    (window as any).L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
      }
    ).addTo(this.mapInstance);

    if (this.latitude && this.longitude) {
      this.markerInstance = (window as any).L.marker([
        this.latitude,
        this.longitude,
      ]).addTo(this.mapInstance);
    }

    this.mapInstance.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      this.setMarker(lat, lng);
    });
  }

  setMarker(lat: number, lng: number) {
    if (this.markerInstance) {
      this.markerInstance.setLatLng([lat, lng]);
    } else {
      this.markerInstance = (window as any).L.marker([lat, lng]).addTo(
        this.mapInstance
      );
    }
    this.latitude = lat;
    this.longitude = lng;
  }

  useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      this.mapInstance.setView([lat, lng], 14);
      this.setMarker(lat, lng);
    });
  }

  confirmLocation() {
    if (!this.markerInstance) {
      this.error = 'Please select a location on the map';
      return;
    }
    const { lat, lng } = this.markerInstance.getLatLng();
    this.latitude = lat;
    this.longitude = lng;
    this.error = '';
  }

  onProjectSelect(selectedProjectId: string | null) {
    this.selectedProjectId = selectedProjectId || '';
  }

  onUpdate() {
    if (!this.nameEn || !this.nameAr) {
      this.error = 'Please provide both English and Arabic names';
      return;
    }
    if (!this.locationData?.locationId) {
      this.error = 'Location ID is missing';
      return;
    }
    this.update.emit({
      locationId: this.locationData.locationId,
      nameEn: this.nameEn,
      nameAr: this.nameAr,
      projectId: this.selectedProjectId || undefined,
      latitude: this.latitude,
      longitude: this.longitude,
    });
  }

  onClose() {
    this.close.emit();
  }
}
