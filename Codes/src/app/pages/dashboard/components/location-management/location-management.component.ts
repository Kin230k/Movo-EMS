import { Component, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LocationCardComponent } from './location-card.component';
import { AddLocationModalComponent } from './add-location-modal.component';
import { UpdateLocationModalComponent } from './update-location-modal.component';
import { ThemedButtonComponent } from '../../../../components/shared/themed-button/themed-button';
import { AddZoneModalComponent } from './add-zone-modal.component';
import { DeleteModalComponent } from '../../../../components/shared/delete-modal/delete-modal.component';
import { ComboSelectorComponent } from '../../../../components/shared/combo-selector/combo-selector.component'; // adjust path if needed
import api from '../../../../core/api/api';
import { IdentityService } from '../../../../core/services/identity.service';
import { CardListSkeletionComponent } from '../../../../components/shared/card-list-skeletion/card-list-skeletion.component';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'app-location-management',
  standalone: true,
  outputs: ['refetch'],
  imports: [
    CommonModule,
    TranslateModule,
    LocationCardComponent,
    AddLocationModalComponent,
    UpdateLocationModalComponent,
    ThemedButtonComponent,
    AddZoneModalComponent,
    DeleteModalComponent,
    ComboSelectorComponent,
    CardListSkeletionComponent,
  ],
  templateUrl: './location-management.component.html',
  styleUrls: ['./location-management.component.scss'],
})
export class LocationManagementComponent {
  // tabs: 'locations' | 'zones'
  activeTab: 'locations' | 'zones' = 'locations';
  refetch = new EventEmitter<void>();
  private _loading = false;

  constructor(
    private identity: IdentityService,
    private languageService: LanguageService
  ) {}

  private _projects: any[] = [];
  private _locations: any[] = [];
  get projects(): Array<{ id: string; name: { en: string; ar: string } }> {
    return (this._projects || []).map((p: any) => ({
      id: p.projectId,
      name: p.name,
    }));
  }

  get locations() {
    return this._locations;
  }

  zones: Array<{
    zoneId: string;
    name: string;
    locationId?: string;
  }> = [];

  private _areas: any[] = [];

  // Location modals
  isAddModalOpen = false;
  isUpdateModalOpen = false;
  selectedLocation: any = null;

  // Zone modals & state
  isAddZoneModalOpen = false;
  isDeleteModalOpen = false;
  zoneToDelete: any = null;

  // zone filters - NOTE: removed selectedProjectForZones to force selection via location only
  selectedLocationForZones: string = '';

  async ngOnInit() {
    const who = await this.identity.getIdentity().catch(() => null);
    try {
      this._loading = true;
      const data: any = await api.getLocationsForClient();
      const payload = (data as any)?.result ?? data ?? [];
      this._locations = Array.isArray(payload.locations)
        ? payload.locations
        : [];
      if (who?.isClient) {
        const data: any = await api.getProjectsByClient({});
        const payload = (data as any)?.result ?? data ?? {};
        this._projects = Array.isArray(payload.projects)
          ? payload.projects
          : [];
      } else {
        const data: any = await api.getAllProjects();
        const payload = (data as any)?.result ?? data ?? {};
        this._projects = Array.isArray(payload.projects)
          ? payload.projects
          : [];
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      this._projects = [];
    } finally {
      this._loading = false;
    }
  }

  // Handle location selection for zones
  async onLocationForZonesSelected(locationId: string | null) {
    this.selectedLocationForZones = locationId || '';
    if (this.selectedLocationForZones) {
      try {
        const data: any = await api.getAreasByLocation({
          locationId: this.selectedLocationForZones,
        });
        const payload = (data as any)?.result ?? data ?? [];
        this._areas = Array.isArray(payload.areas) ? payload.areas : [];
      } catch (error) {
        console.error('Error loading areas:', error);
        this._areas = [];
      }
    } else {
      this._areas = [];
    }
  }

  // --- location handlers (unchanged except small improvements) ---
  openAddModal() {
    this.isAddModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeAddModal() {
    this.isAddModalOpen = false;
    document.body.style.overflow = '';
  }

  async handleCreateLocation(payload: {
    nameEn: string;
    nameAr: string;
    projectId?: string;
    latitude?: number;
    longitude?: number;
  }) {
    try {
      const newLocation = await api.createLocation({
        name: { en: payload.nameEn, ar: payload.nameAr },
        projectId: payload.projectId,
        latitude: payload.latitude,
        longitude: payload.longitude,
      } as any);

      this._locations = [newLocation, ...this._locations];
      this.closeAddModal();
      // Emit refetch event to notify parent components
      this.refetch.emit();
    } catch (error) {}
  }

  async handleDeleteLocation(locationId: string) {
    if (!confirm('Are you sure you want to delete this location?')) return;
    try {
      await api.deleteLocation({ locationId: String(locationId) } as any);
      this._locations = this._locations.filter(
        (loc) => loc.locationId !== locationId
      );
      this.zones = this.zones.filter((z) => z.locationId !== locationId);
      // Emit refetch event to notify parent components
      this.refetch.emit();
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('Error deleting location. Please try again.');
    }
  }

  handleUpdateLocation(location: any) {
    this.selectedLocation = location;
    this.isUpdateModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  async handleLocationUpdate(payload: {
    locationId: string;
    nameEn: string;
    nameAr: string;
    projectId?: string;
    latitude?: number;
    longitude?: number;
  }) {
    try {
      await api.updateLocation({
        locationId: String(payload.locationId),
        name: { en: payload.nameEn, ar: payload.nameAr },
        projectId: payload.projectId,
        latitude: payload.latitude,
        longitude: payload.longitude,
      } as any);
      const index = this.locations.findIndex(
        (loc) => loc.locationId === payload.locationId
      );
      if (index !== -1) {
        this.locations[index] = {
          ...this.locations[index],
          name: { en: payload.nameEn, ar: payload.nameAr },
          projectId: payload.projectId,
          latitude: payload.latitude,
          longitude: payload.longitude,
        };
      }
      this.closeUpdateModal();
      // Emit refetch event to notify parent components
      this.refetch.emit();
    } catch (error) {
      console.error('Error updating location:', error);
      alert('Error updating location. Please try again.');
    }
  }

  closeUpdateModal() {
    this.isUpdateModalOpen = false;
    this.selectedLocation = null;
    document.body.style.overflow = '';
  }

  // --- zone management ---

  openZonesTab() {
    this.activeTab = 'zones';
  }

  openLocationsTab() {
    this.activeTab = 'locations';
  }

  // open add zone modal
  openAddZoneModal() {
    this.isAddZoneModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeAddZoneModal() {
    this.isAddZoneModalOpen = false;
    document.body.style.overflow = '';
  }

  // when add zone modal emits create
  async handleCreateZone(payload: {
    name: { en: string; ar: string };
    projectId?: string;
    locationId?: string;
  }) {
    try {
      await api.createArea({
        name: payload.name,
        locationId: String(payload.locationId || this.selectedLocationForZones),
      } as any);
      // Refresh areas list
      await this.onLocationForZonesSelected(this.selectedLocationForZones);
      this.closeAddZoneModal();
      // Emit refetch event to notify parent components
      this.refetch.emit();
    } catch (error) {
      console.error('Error creating zone:', error);
      alert('Error creating zone. Please try again.');
    }
  }

  // open delete confirmation modal
  confirmDeleteZone(zone: any) {
    this.zoneToDelete = zone;
    this.isDeleteModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  // called by DeleteModal confirm
  async handleConfirmDeleteZone() {
    if (this.zoneToDelete) {
      try {
        await api.deleteArea({
          areaId: String(this.zoneToDelete.zoneId),
        } as any);
        // Refresh areas list
        await this.onLocationForZonesSelected(this.selectedLocationForZones);
        this.zoneToDelete = null;
        // Emit refetch event to notify parent components
        this.refetch.emit();
      } catch (error) {}
    }
    this.isDeleteModalOpen = false;
    document.body.style.overflow = '';
  }

  // cancel delete modal
  handleCancelDelete() {
    this.zoneToDelete = null;
    this.isDeleteModalOpen = false;
    document.body.style.overflow = '';
  }

  // helpers for UI
  get zonesForSelectedLocation() {
    if (!this.selectedLocationForZones) return [];
    return Array.isArray(this._areas)
      ? this._areas.map((a: any, idx: number) => ({
          zoneId: String(a.areaId ?? a.id ?? idx + 1),
          name: a.name ?? '',
          locationId: String(a.locationId ?? this.selectedLocationForZones),
        }))
      : [];
  }

  getProjectNameById(id?: string) {
    if (!id) return '';
    const p = this.projects.find((x) => x.id === id);
    return p ? p.name.en : '';
  }

  getLocationNameById(id?: string) {
    if (!id) return '';
    const l = this.locations.find((x) => x.locationId === id);
    if (!l) return '';
    if (typeof l.name === 'object') return l.name.en;
    return l.name || '';
  }

  // Transform locations for combo selector (expects id and name.en/name.ar format)
  get locationsForCombo() {
    return this.locations.map((location) => ({
      id: location.locationId,
      name:
        typeof location.name === 'object'
          ? location.name
          : { en: location.name || '', ar: '' },
    }));
  }

  // Refetch methods for modals to call after operations
  async refetchProjects(): Promise<void> {
    const who = await this.identity.getIdentity().catch(() => null);
    try {
      if (who?.isClient) {
        const data: any = await api.getProjectsByClient({});
        const payload = (data as any)?.result ?? data ?? {};
        this._projects = Array.isArray(payload.projects)
          ? payload.projects
          : [];
      } else {
        const data: any = await api.getAllProjects();
        const payload = (data as any)?.result ?? data ?? {};
        this._projects = Array.isArray(payload.projects)
          ? payload.projects
          : [];
      }
    } catch (error) {
      console.error('Error refetching projects:', error);
    }
  }

  async refetchAreas(): Promise<void> {
    if (this.selectedLocationForZones) {
      try {
        const data: any = await api.getAreasByLocation({
          locationId: this.selectedLocationForZones,
        });
        const payload = (data as any)?.result ?? data ?? [];
        this._areas = Array.isArray(payload) ? payload : [];
      } catch (error) {
        console.error('Error refetching areas:', error);
        this._areas = [];
      }
    }
  }

  async refetchAll(): Promise<void> {
    await this.refetchProjects();
    await this.refetchAreas();
  }
  get currentLanguage() {
    return this.languageService.currentLang;
  }
  get loading() {
    return this._loading;
  }
}
