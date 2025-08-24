// permissions-management.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from '../../dashboard/dashboard.component';
import { CardListComponent } from './card-list/card-list.component';
import { ProfileCardComponent } from './profile-card/profile-card.component';
import { TopbarComponent } from './topbar/topbar.component';

@Component({
  selector: 'app-permissions-management',
  standalone: true,
  imports: [CommonModule, CardListComponent, TopbarComponent],
  templateUrl: 'permissions-management.component.html',
  styleUrls: ['./permissions-management.component.scss'],
})
export class PermissionsManagementComponent {
  cards = Array.from({ length: 6 }).map((_, i) => ({
    id: i + 1,
    name: 'Name',
    role: 'Supervisor',
    phone: '0987654321',
    marital: 'Marred',
    date: '2024/2/13',
    salary: '1200$',
  }));
}
