import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardListComponent } from '../../../../components/shared/card-list/card-list.component';
import { TopbarComponent } from './topbar/topbar.component';
import { ProfileCardComponent } from './profile-card/profile-card.component';
import { TranslateModule } from '@ngx-translate/core';
import { QueryStatusComponent } from '../../../../components/shared/query-status/query-status.component';
import { ApiQueriesService } from '../../../../core/services/queries.service';
import { IdentityService } from '../../../../core/services/identity.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    CardListComponent,
    TopbarComponent,
    TranslateModule,
    QueryStatusComponent,
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent {
  constructor(
    private apiQueries: ApiQueriesService,
    private identity: IdentityService
  ) {}

  projectsQuery: any;
  get projects() {
    const data = this.projectsQuery?.data?.() ?? [];
    return data?.projects?.map((p: any) => ({ id: p.projectId, name: p.name }));
  }

  async ngOnInit() {
    const who = await this.identity.getIdentity().catch(() => null);
    if (who?.isClient) {
      this.projectsQuery = this.apiQueries.getProjectsByClientQuery({});
    } else {
      this.projectsQuery = this.apiQueries.getAllProjectsQuery();
    }
  }

  users: any[] = [];
  profileCardComponent = ProfileCardComponent;

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

  async onProjectSelected(projectId: string | null) {
    if (projectId === null) {
      this.users = [];
      this._isFinished = true;
      this._isLoading = false;
      this._error = null;
      return;
    }

    this._isLoading = true;
    this._error = null;
    this._isFinished = false;
    this.users = [];

    try {
      const users = await this.fetchUsers(projectId);
      this.users = users;
      this._isFinished = true;
    } catch (err) {
      this._error = err;
      this.users = [];
    } finally {
      this._isLoading = false;
    }
  }

  private async fetchUsers(projectId: string | number): Promise<any[]> {
    const query = this.apiQueries.getProjectUsersQuery({
      projectId: String(projectId),
    });
    const data = query.data?.() ?? {};
    return Array.isArray(data.users) ? data.users : [];
  }
}
