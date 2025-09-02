import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LocationCardComponent } from './location-card.component';
import { AddLocationModalComponent } from './add-location-modal.component';
import { UpdateLocationModalComponent } from './update-location-modal.component';
import { ThemedButtonComponent } from '../../../../components/shared/themed-button/themed-button';
import { AddZoneModalComponent } from './add-zone-modal.component';
import { DeleteModalComponent } from '../../../../components/shared/delete-modal/delete-modal.component';
import { ComboSelectorComponent } from '../../../../components/shared/combo-selector/combo-selector.component'; // adjust path if needed

@Component({
  selector: 'app-location-management',
  standalone: true,
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
  ],
  templateUrl: './location-management.component.html',
  styleUrls: ['./location-management.component.scss'],
})
export class LocationManagementComponent {
  // tabs: 'locations' | 'zones'
  activeTab: 'locations' | 'zones' = 'locations';

  projects: Array<{
    id: string;
    name: { en: string; ar: string };
  }> = [
    {
      id: 'proj-1',
      name: { en: 'Project A', ar: 'المشروع أ' },
    },
    {
      id: 'proj-2',
      name: { en: 'Project B', ar: 'المشروع ب' },
    },
    {
      id: 'proj-3',
      name: { en: 'Project C', ar: 'المشروع ج' },
    },
  ];

  locations: Array<{
    locationId: string;
    name: { en: string; ar: string } | string;
    projectId?: string;
    latitude?: number;
    longitude?: number;
  }> = [
    {
      locationId: 'loc-1',
      name: { en: 'Headquarters', ar: 'المقر الرئيسي' },
      projectId: 'proj-1',
    },
    {
      locationId: 'loc-2',
      name: { en: 'Warehouse', ar: 'المستودع' },
      projectId: 'proj-2',
    },
  ];

  zones: Array<{
    zoneId: string;
    name: string;
    locationId?: string;
  }> = [
    {
      zoneId: 'zone-1',
      name: 'Main Yard',
      locationId: 'loc-1',
    },
  ];

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

  // Handle location selection for zones
  onLocationForZonesSelected(locationId: string | null) {
    this.selectedLocationForZones = locationId || '';
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

  handleCreateLocation(payload: {
    nameEn: string;
    nameAr: string;
    projectId?: string;
    latitude?: number;
    longitude?: number;
  }) {
    const selectedProject = payload.projectId
      ? this.projects.find((p) => p.id === payload.projectId)
      : null;

    const newLocation = {
      locationId: crypto?.randomUUID
        ? crypto.randomUUID()
        : `loc-${Date.now()}`,
      name: { en: payload.nameEn, ar: payload.nameAr },
      projectName: selectedProject?.name,
      projectId: selectedProject?.id,
      latitude: payload.latitude,
      longitude: payload.longitude,
    };
    this.locations = [newLocation, ...this.locations];
    this.closeAddModal();
  }

  handleDeleteLocation(locationId: string) {
    if (confirm('Are you sure you want to delete this location?')) {
      this.locations = this.locations.filter(
        (loc) => loc.locationId !== locationId
      );
      // optionally remove zones belonging to this location:
      this.zones = this.zones.filter((z) => z.locationId !== locationId);
    }
  }

  handleUpdateLocation(location: any) {
    this.selectedLocation = location;
    this.isUpdateModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  handleLocationUpdate(payload: {
    locationId: string;
    nameEn: string;
    nameAr: string;
    projectId?: string;
    latitude?: number;
    longitude?: number;
  }) {
    const index = this.locations.findIndex(
      (loc) => loc.locationId === payload.locationId
    );
    if (index !== -1) {
      const selectedProject = payload.projectId
        ? this.projects.find((p) => p.id === payload.projectId)
        : null;

      this.locations[index] = {
        ...this.locations[index],
        name: { en: payload.nameEn, ar: payload.nameAr },
        projectId: selectedProject?.id,
        latitude: payload.latitude,
        longitude: payload.longitude,
      };
    }
    this.closeUpdateModal();
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
  handleCreateZone(payload: {
    name: string;
    projectId?: string;
    locationId?: string;
  }) {
    const newZone = {
      zoneId: crypto?.randomUUID ? crypto.randomUUID() : `zone-${Date.now()}`,
      name: payload.name,
      locationId: payload.locationId,
    };
    this.zones = [newZone, ...this.zones];
    this.closeAddZoneModal();
  }

  // open delete confirmation modal
  confirmDeleteZone(zone: any) {
    this.zoneToDelete = zone;
    this.isDeleteModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  // called by DeleteModal confirm
  handleConfirmDeleteZone() {
    if (this.zoneToDelete) {
      this.zones = this.zones.filter(
        (z) => z.zoneId !== this.zoneToDelete.zoneId
      );
      this.zoneToDelete = null;
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
    return this.zones.filter(
      (z) => z.locationId === this.selectedLocationForZones
    );
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
}
