// src/app/permissions-management/permissions-management.component.ts
import { Component, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardListComponent } from '../../../../components/shared/card-list/card-list.component';
import { TopbarComponent } from '../attendance-management/topbar/topbar.component';
import { AttendanceProfileCardComponent } from '../attendance-management/attendance-profile-card/attendance-profile-card.component'; // adjust path if needed
import { CardListSkeletionComponent } from '../../../../components/shared/card-list-skeletion/card-list-skeletion.component';
import { TranslateModule } from '@ngx-translate/core';
import { IdentityService } from '../../../../core/services/identity.service';
import api from '../../../../core/api/api';

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
  constructor(private identity: IdentityService) {}

  private _projects: any[] = [];

  get projects() {
    return this._projects.map((p: any) => ({ id: p.projectId, name: p.name }));
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
      const data: any = await api.getUserAttendancesByProject({
        projectId: String(projectId),
      });
      const payload = (data as any)?.result ?? data ?? {};
      const normalizedUsers = Array.isArray(payload.data)
        ? payload.data.map((a: any, idx: number) => ({
            id: a.attendanceId ?? a.id ?? idx + 1,
            userId: String(a.userId ?? a.id ?? idx + 1),
            name: a.name ?? {
              en: a.displayName ?? 'User',
              ar: a.displayName ?? 'User',
            },
            role: a.role ?? 'User',
            isPresent: true,
            attendanceTimestamp: a.attendanceTimestamp,
            picture: a.picture ?? '/assets/images/image.png',
          }))
        : [];
      this.users = normalizedUsers;
      this.usersForSelector = normalizedUsers.map((u: any) => ({
        id: u.userId,
        name: u.name,
        role: u.role,
        picture: u.picture,
      }));

      const areasData: any = await api.getAllAreas();
      const areasPayload = (areasData as any)?.result ?? areasData ?? {};
      this.areasForSelector = Array.isArray(areasPayload.areas)
        ? areasPayload.areas.map((a: any, idx: number) => ({
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
  async onAddAttendance(payload: any) {
    // payload has userId, name, projectId, role, isPresent, attendanceTimestamp, picture
    try {
      await api.createAttendance({
        signedWith: payload.signedWith ?? 'MANUAL',
        userId: String(payload.userId),
        areaId: String(payload.areaId),
      });
      this.users = [...this.users, payload];
    } catch (error) {
      console.error('Error recording attendance:', error);
    }
  }
  async ngOnInit() {
    const who = await this.identity.getIdentity().catch(() => null);
    try {
      if (who?.isClient) {
        const data: any = await api.getProjectsByClient({});
        const payload = (data as any)?.result ?? data ?? {};
        this._projects = Array.isArray(payload.projects)
          ? payload.projects
          : [];
      } else {
        const data: any = await api.getAllProjects();
        const payload = (data as any)?.result ?? data ?? {};
        this._projects = Array.isArray(payload.projects)
          ? payload.projects
          : [];
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      this._projects = [];
    }
  }
  // Add this line so the template binding exists at runtime:
  attendanceCardComponent = AttendanceProfileCardComponent;

  // Refetch methods for modals
  async refetchProjects(): Promise<void> {
    const who = await this.identity.getIdentity().catch(() => null);
    try {
      if (who?.isClient) {
        const data: any = await api.getProjectsByClient({});
        const payload = (data as any)?.result ?? data ?? {};
        this._projects = Array.isArray(payload.projects)
          ? payload.projects
          : [];
      } else {
        const data: any = await api.getAllProjects();
        const payload = (data as any)?.result ?? data ?? {};
        this._projects = Array.isArray(payload.projects)
          ? payload.projects
          : [];
      }
    } catch (error) {
      console.error('Error refetching projects:', error);
    }
  }

  async refetchUsers(): Promise<void> {
    if (this.selectedProjectId) {
      await this.onProjectSelected(this.selectedProjectId);
    }
  }

  async refetchAll(): Promise<void> {
    await this.refetchProjects();
    await this.refetchUsers();
  }
  async onDeleteAttendance($event: Event) {
    console.log('onDeleteAttendance', $event);
    await api.deleteAttendance({ attendanceId: String($event) });
    await this.refetchUsers();
  }
  async onEditAttendance($event: Event) {}
}
