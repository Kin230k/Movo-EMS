import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ComboSelectorComponent } from '../../../../../components/shared/combo-selector/combo-selector.component';
import { AddFormModalComponent } from './add-form-modal.component';
import { ThemedButtonComponent } from '../../../../../components/shared/themed-button/themed-button';
import { TranslateModule } from '@ngx-translate/core';
import api from '../../../../../core/api/api';
export interface Project {
  id: string;
  name: { en: string; ar: string };
}

export interface Location {
  id: string;
  name: { en: string; ar: string };
}

@Component({
  selector: 'app-form-management-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  imports: [
    CommonModule,
    ComboSelectorComponent,
    AddFormModalComponent,
    ThemedButtonComponent,
    TranslateModule,
  ],
  standalone: true,
})
export class FormManagementTopbarComponent {
  @Input() projects: Project[] = [];
  @Input() locations: Location[] = [];
  @Output() projectSelected = new EventEmitter<string | null>();
  @Output() refetch = new EventEmitter<void>();

  showAddFormModal = false;
  selectedProjectId: string | null = null;

  constructor(private router: Router) {}

  onProjectSelected(projectId: string | null) {
    this.selectedProjectId = projectId;
    this.projectSelected.emit(projectId);
  }

  openAddFormModal() {
    this.showAddFormModal = true;
  }

  onModalClose() {
    this.showAddFormModal = false;
  }

  async onFormCreated(formData: {
    projectId: string;
    locationId?: string;
    formLanguage?: string;
    formName?: string;
  }) {
    try {
      const result = await api.createForm({
        projectId: formData.projectId,
        locationId: formData.locationId,
        formLanguage: formData.formLanguage,
        formTitle: formData.formName,
      } as any);

      if ((result as any).success) {
        const formId = String(
          (result as any)?.formId ?? (result as any)?.id ?? ''
        );
        this.router.navigate(['/dashboard/create-questions'], {
          queryParams: {
            projectId: formData.projectId,
            locationId: formData.locationId,
            formId,
            formName: (formData as any).formName,
          },
        });
        this.showAddFormModal = false;
        // Emit refetch event to notify parent components
        this.refetch.emit();
      } else {
        console.log('created', result);
      }
    } catch (error) {
    }
  }
}
