import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ComboSelectorComponent } from '../../../../../components/shared/combo-selector/combo-selector.component';
import { AddFormModalComponent } from './add-form-modal.component';
import { ThemedButtonComponent } from '../../../../../components/shared/themed-button/themed-button';
import { TranslateModule } from '@ngx-translate/core';
import { ApiQueriesService } from '../../../../../core/services/queries.service';
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

  showAddFormModal = false;
  selectedProjectId: string | null = null;

  constructor(private router: Router, private apiQueries: ApiQueriesService) {}

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

  onFormCreated(formData: { projectId: string; locationId?: string }) {
    const mutate = this.apiQueries.createFormMutation();
    mutate.mutate(
      {
        projectId: formData.projectId,
        locationId: formData.locationId,
        formTitle: (formData as any).formName,
      } as any,
      {
        onSuccess: (created: any) => {
          const formId = String(created?.formId ?? created?.id ?? '');
          this.router.navigate(['/dashboard/create--questions'], {
            queryParams: {
              projectId: formData.projectId,
              locationId: formData.locationId,
              formId,
              formName: (formData as any).formName,
            },
          });
          this.showAddFormModal = false;
        },
      } as any
    );
  }
}
