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
import { ApiQueriesService } from '../../../../core/services/queries.service';
import { IdentityService } from '../../../../core/services/identity.service';

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
  constructor(
    private apiQueries: ApiQueriesService,
    private identity: IdentityService
  ) {}

  projectsQuery: any;
  get projects(): Project[] {
    const data = this.projectsQuery?.data() ?? [];
    return (data || []).map((p: any) => ({ id: p.projectId, name: p.name }));
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
    if (who?.isClient) {
      this.projectsQuery = this.apiQueries.getProjectsByClientQuery({});
    } else {
      this.projectsQuery = this.apiQueries.getAllProjectsQuery();
    }
  }

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
    const q = this.apiQueries.getFormByUserQuery({});
    const resp = q.data?.() ?? [];
    const list: FormData[] = Array.isArray(resp)
      ? resp
          .filter((f: any) => f.projectId === projectId || f.locationId)
          .map((f: any) => ({
            formId: f.formId ?? f.id,
            projectId: f.projectId,
            projectName: f.projectName,
            locationId: f.locationId,
            locationName: f.locationName,
            createdAt: f.createdAt ?? new Date().toISOString(),
          }))
      : [];
    return list;
  }

  getProjectName(projectId?: string): string {
    if (!projectId) return '';
    const project = this.projects?.find((p) => p.id === projectId);
    return project?.name?.en ?? '';
  }
}
