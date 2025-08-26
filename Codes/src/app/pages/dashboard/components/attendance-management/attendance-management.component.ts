// src/app/permissions-management/permissions-management.component.ts
import { Component, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardListComponent } from '../../../../components/shared/card-list/card-list.component';
import { TopbarComponent } from '../attendance-management/topbar/topbar.component';
import { AttendanceProfileCardComponent } from '../attendance-management/attendance-profile-card/attendance-profile-card.component'; // adjust path if needed

@Component({
  selector: 'app-attendance-management',
  standalone: true,
  imports: [CommonModule, CardListComponent, TopbarComponent],
  templateUrl: 'attendance-management.component.html',
  styleUrls: ['./attendance-management.component.scss'],
})
export class AttendanceManagementComponent {
  projects = [
    { id: 1, name: 'Project A' },
    { id: 2, name: 'Project B' },
    { id: 3, name: 'Project C' },
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

  // Add this line so the template binding exists at runtime:

  onProjectSelected(projectId: number) {
    this.users = this.fetchUsers(projectId);
  }

  private fetchUsers(projectId: number): any[] {
    // Mock fetch: return users for the project or empty array
    return this.mockUsers[projectId] || [];
  }

  // Add this line so the template binding exists at runtime:
  attendanceCardComponent = AttendanceProfileCardComponent;
}
