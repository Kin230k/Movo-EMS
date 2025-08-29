// src/app/permissions-management/permissions-management.component.ts
import { Component, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardListComponent } from '../../../../components/shared/card-list/card-list.component';
import { TopbarComponent } from '../attendance-management/topbar/topbar.component';
import { AttendanceProfileCardComponent } from '../attendance-management/attendance-profile-card/attendance-profile-card.component'; // adjust path if needed
import { CardListSkeletionComponent } from '../../../../components/shared/card-list-skeletion/card-list-skeletion.component';
import { TranslateModule } from '@ngx-translate/core';

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
  projects = [
    { id: 1, name: { ar: 'مشروع A', en: 'Project A' } },
    { id: 2, name: { ar: 'مشروع B', en: 'Project B' } },
    { id: 3, name: { ar: 'مشروع C', en: 'Project C' } },
  ];

  // Mock users data per project
  private mockUsers: { [key: number]: any[] } = {
    1: Array.from({ length: 3 }).map((_, i) => ({
      userId: i + 1,
      name: { en: `User A${i + 1}`, ar: `يوزر A${i + 1}` },
      role: 'Main User',
      isPresent: true,
      attendanceTimestamp: new Date(),
      picture: '/assets/images/image.png',
    })),
    2: Array.from({ length: 4 }).map((_, i) => ({
      userId: i + 1,
      name: { en: `User B${i + 1}`, ar: `يوزر B${i + 1}` },
      role: 'Supervisor',
      isPresent: true,
      attendanceTimestamp: new Date(),
      picture: '/assets/images/image.png',
    })),
    3: Array.from({ length: 2 }).map((_, i) => ({
      userId: i + 1,
      name: { en: `User C${i + 1}`, ar: `يوزر C${i + 1}` },
      role: 'Senior Supervisor',
      isPresent: true,
      attendanceTimestamp: new Date(),
      picture: '/assets/images/image.png',
    })),
  };

  users: any[] = []; // Initially no users
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
  async onProjectSelected(projectId: number | null) {
    if (projectId === null) {
      // Handle deselection - clear users list
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

  private async fetchUsers(projectId: number): Promise<any[]> {
    await new Promise((r) => setTimeout(r, 900));
    return this.mockUsers[projectId] || [];
  }
  // Add this line so the template binding exists at runtime:
  attendanceCardComponent = AttendanceProfileCardComponent;
}
