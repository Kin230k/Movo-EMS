import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardListComponent } from '../../../../components/shared/card-list/card-list.component';
import { TopbarComponent } from '../user-management/topbar/topbar.component';
import { ProfileCardComponent } from '../user-management/profile-card/profile-card.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, CardListComponent, TopbarComponent],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent {
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
      phone: '0987654321',
      email: 'testA@gmail.com',
      rate: '1000$',
      picture: '/assets/images/image.png',
    })),
    2: Array.from({ length: 4 }).map((_, i) => ({
      userId: i + 1,
      name: { en: `User B${i + 1}`, ar: `يوزر B${i + 1}` },
      role: 'Supervisor',
      phone: '1234567890',
      email: 'testB@gmail.com',
      rate: '1200$',
      picture: '/assets/images/image.png',
    })),
    3: Array.from({ length: 2 }).map((_, i) => ({
      userId: i + 1,
      name: { en: `User C${i + 1}`, ar: `يوزر C${i + 1}` },
      role: 'Senior Supervisor',
      phone: '5555555555',
      email: 'testC@gmail.com',
      rate: '1500$',
      picture: '/assets/images/image.png',
    })),
  };

  users: any[] = []; // Initially no users

  // Add this line so the template binding exists at runtime:
  profileCardComponent = ProfileCardComponent;

  onProjectSelected(projectId: number) {
    this.users = this.fetchUsers(projectId);
  }

  private fetchUsers(projectId: number): any[] {
    // Mock fetch: return users for the project or empty array
    return this.mockUsers[projectId] || [];
  }
}
