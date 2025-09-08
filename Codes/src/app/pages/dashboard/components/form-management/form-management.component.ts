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
import { IdentityService } from '../../../../core/services/identity.service';
import api from '../../../../core/api/api';

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
  constructor(private identity: IdentityService) {}

  private _projects: Project[] = [];

  get projects(): Project[] {
    return this._projects;
  }

  locations: Location[] = [];

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

  async ngOnInit() {
    const who = await this.identity.getIdentity().catch(() => null);
    try {
      if (who?.isClient) {
        const data: any = await api.getProjectsByClient({});
        const payload = (data as any)?.result ?? data ?? {};
        this._projects = Array.isArray(payload.projects)
          ? payload.projects.map((p: any) => ({
              id: p.projectId,
              name: p.name,
            }))
          : [];
      } else {
        const data: any = await api.getAllProjects();
        const payload = (data as any)?.result ?? data ?? {};
        this._projects = Array.isArray(payload.projects)
          ? payload.projects.map((p: any) => ({
              id: p.projectId,
              name: p.name,
            }))
          : [];
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      this._projects = [];
    }
  }

  onProjectSelected(projectId: string | null) {
    this.selectedProjectId = projectId;
    if (projectId) {
      // Reset states when starting to load
      this.forms = [];
      this._isFinished = false;
      this._error = null;
      this.loadForms(projectId);
    } else {
      // Clear forms and states when no project selected
      this.forms = [];
      this._isFinished = false;
      this._error = null;
      this._isLoading = false;
    }
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
    try {
      const data: any = await api.getFormsByProject({ projectId });
      const payload = (data as any)?.result ?? data ?? {};
      console.log('resp.forms', payload.forms);
      const list: FormData[] = Array.isArray(payload.forms)
        ? payload.forms.map((f: any) => ({
            formId: f.formId ?? f.formId ?? f.id,
            projectId: f.projectId,
            projectName: f.projectName,
            locationId: f.locationId,
            locationName: f.locationName,
            createdAt: f.createdAt ?? new Date().toISOString(),
          }))
        : [];
      console.log('list', list);
      return list;
    } catch (error) {
      console.error('Error fetching forms:', error);
      return [];
    }
  }

  getProjectName(projectId?: string): string {
    if (!projectId) return '';
    const project = this.projects?.find((p) => p.id === projectId);
    return project?.name?.en ?? '';
  }

  // Refetch methods for modals to call after operations
  async refetchProjects(): Promise<void> {
    const who = await this.identity.getIdentity().catch(() => null);
    try {
      this._isLoading = true;
      if (who?.isClient) {
        const data: any = await api.getProjectsByClient({});
        const payload = (data as any)?.result ?? data ?? {};
        this._projects = Array.isArray(payload.projects)
          ? payload.projects.map((p: any) => ({
              id: p.projectId,
              name: p.name,
            }))
          : [];
      } else {
        const data: any = await api.getAllProjects();
        const payload = (data as any)?.result ?? data ?? {};
        this._projects = Array.isArray(payload.projects)
          ? payload.projects.map((p: any) => ({
              id: p.projectId,
              name: p.name,
            }))
          : [];
      }
    } catch (error) {
      console.error('Error refetching projects:', error);
      this._error = error;
    } finally {
      this._isLoading = false;
    }
  }

  async refetchForms(): Promise<void> {
    if (this.selectedProjectId) {
      await this.loadForms(this.selectedProjectId);
    }
  }

  async refetchAll(): Promise<void> {
    await this.refetchProjects();
    await this.refetchForms();
  }

  async onCardEvent(event: { event: string; data: any; item: any }) {
    if (event.event === 'formDeleted') {
      // Refresh forms data after deletion
      await this.refetchForms();
    }
  }
}
