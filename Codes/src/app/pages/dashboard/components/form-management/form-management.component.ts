import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormManagementTopbarComponent,
  Project,
  Location,
} from './topbar/topbar.component';
import { CardListComponent } from '../../../../components/shared/card-list/card-list.component';
import { FormCardComponent, FormData } from './form-card.component';
import { FormListSkeletonComponent } from '../../../../components/shared/form-list-skeleton/form-list-skeleton.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-form-management',
  imports: [
    CommonModule,
    FormManagementTopbarComponent,
    CardListComponent,
    FormListSkeletonComponent,
    TranslateModule,
  ],
  templateUrl: './form-management.component.html',
  styleUrl: './form-management.component.scss',
})
export class FormManagementComponent {
  // Mock data for projects and locations
  projects: Project[] = [
    { id: '1', name: { en: 'Project Alpha', ar: 'مشروع ألفا' } },
    { id: '2', name: { en: 'Project Beta', ar: 'مشروع بيتا' } },
    { id: '3', name: { en: 'Project Gamma', ar: 'مشروع غاما' } },
    { id: '4', name: { en: 'Project Delta', ar: 'مشروع دلتا' } },
  ];

  locations: Location[] = [
    { id: '1', name: { en: 'New York Office', ar: 'مكتب نيويورك' } },
    { id: '2', name: { en: 'London Office', ar: 'مكتب لندن' } },
    { id: '3', name: { en: 'Dubai Office', ar: 'مكتب دبي' } },
    { id: '4', name: { en: 'Singapore Office', ar: 'مكتب سنغافورة' } },
  ];

  private mockForms: { [key: string]: FormData[] } = {
    '1': [
      {
        formId: 'f1a2b3c4-d5e6-7890-abcd-ef1234567890',
        projectId: '1',
        projectName: { en: 'Project Alpha', ar: 'مشروع ألفا' },
        createdAt: '2024-01-15T10:30:00Z',
      },
      {
        formId: 'f2b3c4d5-e6f7-8901-bcde-f23456789012',
        locationId: '1',
        locationName: { en: 'New York Office', ar: 'مكتب نيويورك' },
        createdAt: '2024-01-20T14:45:00Z',
      },
    ],
    '2': [
      {
        formId: 'f3c4d5e6-f7g8-9012-cdef-g34567890123',
        projectId: '2',
        projectName: { en: 'Project Beta', ar: 'مشروع بيتا' },
        createdAt: '2024-01-10T09:15:00Z',
      },
      {
        formId: 'f4d5e6f7-g8h9-0123-defg-h45678901234',
        locationId: '2',
        locationName: { en: 'London Office', ar: 'مكتب لندن' },
        createdAt: '2024-01-25T16:20:00Z',
      },
      {
        formId: 'f5e6f7g8-h9i0-1234-efgh-i56789012345',
        locationId: '3',
        locationName: { en: 'Dubai Office', ar: 'مكتب دبي' },
        createdAt: '2024-01-18T11:00:00Z',
      },
    ],
    '3': [
      {
        formId: 'f6f7g8h9-i0j1-2345-fghi-j67890123456',
        projectId: '3',
        projectName: { en: 'Project Gamma', ar: 'مشروع غاما' },
        createdAt: '2024-01-12T13:30:00Z',
      },
    ],
    '4': [
      {
        formId: 'f7g8h9i0-j1k2-3456-ghij-k78901234567',
        locationId: '4',
        locationName: { en: 'Singapore Office', ar: 'مكتب سنغافورة' },
        createdAt: '2024-01-22T08:45:00Z',
      },
    ],
  };

  forms: FormData[] = [];
  formCardComponent = FormCardComponent;

  private _isLoading = false;
  // expose error as any so template can use error?.message
  private _error: any = null;
  private _isFinished = false;

  get isLoading() {
    return this._isLoading;
  }
  get error(): any {
    return this._error;
  }
  get isFinished() {
    return this._isFinished;
  }

  selectedProjectId: string | null = null;

  onProjectSelected(projectId: string | null) {
    this.selectedProjectId = projectId;
    if (projectId) {
      this.loadForms(projectId);
    } else {
      this.forms = [];
      this._isFinished = false;
    }
    console.log('Project selected:', projectId);
  }

  async loadForms(projectId: string) {
    this._isLoading = true;
    this._error = null;
    this._isFinished = false;
    this.forms = [];

    try {
      const forms = await this.fetchForms(projectId);
      this.forms = forms;
      this._isFinished = true;
    } catch (err) {
      this._error = err;
      this.forms = [];
    } finally {
      this._isLoading = false;
    }
  }

  private async fetchForms(projectId: string): Promise<FormData[]> {
    await new Promise((r) => setTimeout(r, 900));
    return this.mockForms[projectId] || [];
  }

  getProjectName(projectId?: string): string {
    if (!projectId) return '';
    const project = this.projects?.find((p) => p.id === projectId);
    return project?.name?.en ?? '';
  }
}
