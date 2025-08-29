import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LocationCardComponent } from './location-card.component';
import { AddLocationModalComponent } from './add-location-modal.component';
import { UpdateLocationModalComponent } from './update-location-modal.component';
import { ThemedButtonComponent } from '../../../../components/shared/themed-button/themed-button';

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
  ],
  templateUrl: './location-management.component.html',
  styleUrls: ['./location-management.component.scss'],
})
export class LocationManagementComponent {
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
    projectName?: { en: string; ar: string } | string;
    latitude?: number;
    longitude?: number;
  }> = [
    {
      locationId: 'loc-1',
      name: { en: 'Headquarters', ar: 'المقر الرئيسي' },
      projectName: { en: 'Project A', ar: 'المشروع أ' },
    },
    {
      locationId: 'loc-2',
      name: { en: 'Warehouse', ar: 'المستودع' },
      projectName: { en: 'Project B', ar: 'المشروع ب' },
    },
  ];

  isAddModalOpen = false;
  isUpdateModalOpen = false;
  selectedLocation: any = null;

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
      locationId: crypto.randomUUID ? crypto.randomUUID() : `loc-${Date.now()}`,
      name: { en: payload.nameEn, ar: payload.nameAr },
      projectName: selectedProject?.name,
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
        projectName: selectedProject?.name,
        latitude: payload.latitude,
        longitude: payload.longitude,
      };
    }
    // TODO: update the location in the database
    this.closeUpdateModal();
  }

  closeUpdateModal() {
    this.isUpdateModalOpen = false;
    this.selectedLocation = null;
    document.body.style.overflow = '';
  }
}
