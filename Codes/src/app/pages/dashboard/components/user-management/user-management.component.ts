import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardListComponent } from '../../../../components/shared/card-list/card-list.component';
import { TopbarComponent } from './topbar/topbar.component';
import { ProfileCardComponent } from './profile-card/profile-card.component';
import { TranslateModule } from '@ngx-translate/core';
import api from '../../../../core/api/api';
import { IdentityService } from '../../../../core/services/identity.service';
import { CardListSkeletionComponent } from "../../../../components/shared/card-list-skeletion/card-list-skeletion.component";

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, CardListComponent, TopbarComponent, TranslateModule, CardListSkeletionComponent],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent {
  constructor(private identity: IdentityService) {}

  private _projects: any[] = [];

  get projects() {
    return this._projects.map((p: any) => ({ id: p.projectId, name: p.name }));
  }

  async ngOnInit() {
    const who = await this.identity.getIdentity().catch(() => null);
    try {
      this._isLoading = true;
      if (who?.isClient) {
        const data: any = await api.getProjectsByClient({});
        const payload = (data as any)?.result ?? data ?? {};
        if (data.success) {
          this._projects = Array.isArray(payload.projects)
            ? payload.projects
            : [];
        } else {
          this._error = data.issues[0].message;
        }
      } else {
        const data: any = await api.getAllProjects();
        const payload = (data as any)?.result ?? data ?? {};
        if (data.success) {
          this._projects = Array.isArray(payload.projects)
            ? payload.projects
            : [];
        } else {
          this._error = data.issues[0].message;
        }
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      this._projects = [];
    } finally {
      this._isLoading = false;
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
      console.log(users);
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
    try {
      const data: any = await api.getProjectUsers({
        projectId: String(projectId),
      });
      const payload = (data as any)?.result ?? data ?? {};
      return Array.isArray(payload.users)
        ? payload.users.map((u: any) => ({
            ...u,
            projectId: projectId,
          }))
        : [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }
}
