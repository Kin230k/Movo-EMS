import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardListComponent } from '../../../../components/shared/card-list/card-list.component';
import { TopbarComponent } from './topbar/topbar.component';
import { ProfileCardComponent } from './profile-card/profile-card.component';
import { CardListSkeletionComponent } from '../../../../components/shared/card-list-skeletion/card-list-skeletion.component';
import { TranslateModule } from '@ngx-translate/core';
import { QueryStatusComponent } from '../../../../components/shared/query-status/query-status.component';
import { ApiQueriesService } from '../../../../core/services/queries.service';

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
  constructor(private apiQueries: ApiQueriesService) {}

  projectsQuery: any;
  get projects() {
    const data = this.projectsQuery?.data() ?? [];
    return data?.result?.projects;
  }

  ngOnInit() {
    this.projectsQuery = this.apiQueries.getAllActiveProjectsQuery();
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

  async onProjectSelected(projectId: number) {
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

  private async fetchUsers(projectId: number): Promise<any[]> {
    const query = this.apiQueries.getProjectUsersQuery({
      projectId: String(projectId),
    });
    console.log('query', query);
    const data = query.data?.() ?? [];  
    console.log('data', data);
    return Array.isArray(data)
      ? data.map((u: any, idx: number) => ({
          userId: String(u.userId ?? u.id ?? idx + 1),
          name: u.name ?? {
            en: u.displayName ?? 'User',
            ar: u.displayName ?? 'User',
          },
          role: u.role ?? 'User',
          phone: u.phone ?? '',
          email: u.email ?? '',
          rate: u.rate ?? '',
          picture: u.picture ?? '/assets/images/image.png',
          isPresent: false,
        }))
      : [];
  }
}
