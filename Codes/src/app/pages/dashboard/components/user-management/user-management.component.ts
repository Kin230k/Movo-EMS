import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardListComponent } from '../../../../components/shared/card-list/card-list.component';
import { TopbarComponent } from './topbar/topbar.component';
import { ProfileCardComponent } from './profile-card/profile-card.component';
import { SkeletonProfileCardComponent } from '../../../../components/shared/skeleton-profile-card/skeleton-profile-card.component';
import { CardListSkeletionComponent } from '../../../../components/shared/card-list-skeletion/card-list-skeletion.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    CardListComponent,
    TopbarComponent,
    CardListSkeletionComponent,
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent {
  projects = [
    { id: 1, name: 'Project A' },
    { id: 2, name: 'Project B' },
    { id: 3, name: 'Project C' },
  ];

  private mockUsers: { [key: number]: any[] } = {
    1: Array.from({ length: 3 }).map((_, i) => ({
      userId: i + 1,
      name: { en: `User A${i + 1}`, ar: `يوزر A${i + 1}` },
      role: 'Main User',
      phone: '0987654321',
      email: 'testA@gmail.com',
      rate: '1000$',
      picture: '/assets/images/image.png',
      isPresent: Math.random() > 0.5,
    })),
    2: Array.from({ length: 4 }).map((_, i) => ({
      userId: i + 1,
      name: { en: `User B${i + 1}`, ar: `يوزر B${i + 1}` },
      role: 'Supervisor',
      phone: '1234567890',
      email: 'testB@gmail.com',
      rate: '1200$',
      picture: '/assets/images/image.png',
      isPresent: Math.random() > 0.5,
    })),
    3: Array.from({ length: 2 }).map((_, i) => ({
      userId: i + 1,
      name: { en: `User C${i + 1}`, ar: `يوزر C${i + 1}` },
      role: 'Senior Supervisor',
      phone: '5555555555',
      email: 'testC@gmail.com',
      rate: '1500$',
      picture: '/assets/images/image.png',
      isPresent: Math.random() > 0.5,
    })),
  };

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
    await new Promise((r) => setTimeout(r, 900));
    return this.mockUsers[projectId] || [];
  }
}
