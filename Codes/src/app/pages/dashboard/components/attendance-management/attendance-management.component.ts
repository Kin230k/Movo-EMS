// src/app/permissions-management/permissions-management.component.ts
import { Component, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardListComponent } from '../../../../components/shared/card-list/card-list.component';
import { TopbarComponent } from '../attendance-management/topbar/topbar.component';
import { AttendanceProfileCardComponent } from '../attendance-management/attendance-profile-card/attendance-profile-card.component'; // adjust path if needed
import { CardListSkeletionComponent } from '../../../../components/shared/card-list-skeletion/card-list-skeletion.component';
import { TranslateModule } from '@ngx-translate/core';
import { ApiQueriesService } from '../../../../core/services/queries.service';
import { IdentityService } from '../../../../core/services/identity.service';

@Component({
  selector: 'app-attendance-management',
  standalone: true,
  imports: [
    CommonModule,
    CardListComponent,
    CardListSkeletionComponent,
    TopbarComponent,
    TranslateModule,
  ],
  templateUrl: 'attendance-management.component.html',
  styleUrls: ['./attendance-management.component.scss'],
})
export class AttendanceManagementComponent {
  constructor(
    private apiQueries: ApiQueriesService,
    private identity: IdentityService
  ) {}

  projectsQuery: any;
  get projects() {
    const data = this.projectsQuery?.data?.() ?? [];
    return data?.projects?.map((p: any) => ({ id: p.projectId, name: p.name }));
  }

  users: any[] = []; // Initially no users
  selectedProjectId: string | null = null;
  usersForSelector: {
    id: string;
    name: { en: string; ar: string };
    role?: string;
    picture?: string;
  }[] = [];
  areasForSelector: {
    id: string;
    name: { en: string; ar: string };
  }[] = [];
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
  // Add this line so the template binding exists at runtime:
  async onProjectSelected(projectId: string | null) {
    console.log('projectId', projectId);
    if (projectId === null) {
      // Handle deselection - clear users list
      this.users = [];
      this.usersForSelector = [];
      this.selectedProjectId = null;
      this._isFinished = true;
      this._isLoading = false;
      this._error = null;
      return;
    }
    this.selectedProjectId = String(projectId);

    this._isLoading = true;
    this._error = null;
    this._isFinished = false;
    this.users = [];

    try {
      const q = this.apiQueries.getProjectUsersQuery({
        projectId: String(projectId),
      });
      const data = q.data?.() ?? {};
      const normalizedUsers = Array.isArray(data.users)
        ? data.users.map((u: any, idx: number) => ({
            id: u.userId ?? u.id ?? idx + 1,
            userId: String(u.userId ?? u.id ?? idx + 1),
            name: u.name ?? {
              en: u.displayName ?? 'User',
              ar: u.displayName ?? 'User',
            },
            role: u.role ?? 'User',
            isPresent: false,
            attendanceTimestamp: new Date(),
            picture: u.picture ?? '/assets/images/image.png',
          }))
        : [];
      this.users = normalizedUsers;
      this.usersForSelector = normalizedUsers.map((u: any) => ({
        id: u.id,
        name: u.name,
        role: u.role,
        picture: u.picture,
      }));
      const areasQ = this.apiQueries.getAllAreasQuery();
      const areasData = areasQ.data?.() ?? {};
      this.areasForSelector = Array.isArray(areasData.areas)
        ? areasData.areas.map((a: any, idx: number) => ({
            id: a.areaId ?? a.id ?? idx + 1,
            name: a.name,
          }))
        : [];
      this._isFinished = true;
    } catch (err) {
      this._error = err;
      this.users = [];
      this.usersForSelector = [];
      this.areasForSelector = [];
    } finally {
      this._isLoading = false;
    }
  }
  onAddAttendance(payload: any) {
    // payload has userId, name, projectId, role, isPresent, attendanceTimestamp, picture
    const mutate = this.apiQueries.createAttendanceMutation();
    mutate.mutate(
      {
        signedWith: payload.signedWith ?? 'MANUAL',
        userId: String(payload.userId),
        areaId: String(payload.areaId),
      },
      {
        onSuccess: () => {
          this.users = [...this.users, payload];
        },
      } as any
    );
  }
  async ngOnInit() {
    const who = await this.identity.getIdentity().catch(() => null);
    if (who?.isClient) {
      this.projectsQuery = this.apiQueries.getProjectsByClientQuery({});
    } else {
      this.projectsQuery = this.apiQueries.getAllProjectsQuery();
    }
  }
  // Add this line so the template binding exists at runtime:
  attendanceCardComponent = AttendanceProfileCardComponent;
}
