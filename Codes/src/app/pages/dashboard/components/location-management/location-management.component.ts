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
import { ApiQueriesService } from '../../../../core/services/queries.service';

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

  constructor(private apiQueries: ApiQueriesService) {}

  projectsQuery: any;
  get projects(): Array<{ id: string; name: { en: string; ar: string } }> {
    const data = this.projectsQuery?.data?.() ?? [];
    return (data || []).map((p: any) => ({ id: p.projectId, name: p.name }));
  }

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
  }> = [];

  areasQuery: any | null = null;

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

  ngOnInit() {
    this.projectsQuery = this.apiQueries.getAllProjectsQuery();
  }

  // Handle location selection for zones
  onLocationForZonesSelected(locationId: string | null) {
    this.selectedLocationForZones = locationId || '';
    this.areasQuery = this.selectedLocationForZones
      ? this.apiQueries.getAreasByLocationQuery({
          locationId: this.selectedLocationForZones,
        })
      : null;
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
    const mutate = this.apiQueries.createLocationMutation();
    mutate.mutate(
      {
        name: { en: payload.nameEn, ar: payload.nameAr },
        projectId: payload.projectId,
        latitude: payload.latitude,
        longitude: payload.longitude,
      } as any,
      {
        onSuccess: (created: any) => {
          const newLocation = {
            locationId: String(created?.locationId ?? `loc-${Date.now()}`),
            name: { en: payload.nameEn, ar: payload.nameAr },
            projectId: payload.projectId,
            latitude: payload.latitude,
            longitude: payload.longitude,
          };
          this.locations = [newLocation, ...this.locations];
          this.closeAddModal();
        },
      } as any
    );
  }

  handleDeleteLocation(locationId: string) {
    if (!confirm('Are you sure you want to delete this location?')) return;
    const mutate = this.apiQueries.deleteLocationMutation();
    mutate.mutate(
      { locationId: String(locationId) } as any,
      {
        onSuccess: () => {
          this.locations = this.locations.filter(
            (loc) => loc.locationId !== locationId
          );
          this.zones = this.zones.filter((z) => z.locationId !== locationId);
        },
      } as any
    );
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
    const mutate = this.apiQueries.updateLocationMutation();
    mutate.mutate(
      {
        locationId: String(payload.locationId),
        name: { en: payload.nameEn, ar: payload.nameAr },
        projectId: payload.projectId,
        latitude: payload.latitude,
        longitude: payload.longitude,
      } as any,
      {
        onSuccess: () => {
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
        },
      } as any
    );
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
    const mutate = this.apiQueries.createAreaMutation();
    mutate.mutate(
      {
        name: payload.name,
        locationId: String(payload.locationId || this.selectedLocationForZones),
      } as any,
      {
        onSuccess: () => {
          this.areasQuery?.refetch?.();
          this.closeAddZoneModal();
        },
      } as any
    );
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
      const mutate = this.apiQueries.deleteAreaMutation();
      mutate.mutate(
        { areaId: String(this.zoneToDelete.zoneId) } as any,
        {
          onSuccess: () => {
            this.areasQuery?.refetch?.();
            this.zoneToDelete = null;
          },
        } as any
      );
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
    const data = this.areasQuery?.data?.() ?? [];
    return Array.isArray(data)
      ? data.map((a: any, idx: number) => ({
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
}
