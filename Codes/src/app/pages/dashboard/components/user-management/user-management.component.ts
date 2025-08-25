// src/app/permissions-management/permissions-management.component.ts
import { Component, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardListComponent } from '../user-management/card-list/card-list.component';
import { TopbarComponent } from '../user-management/topbar/topbar.component';
import { ProfileCardComponent } from '../user-management/profile-card/profile-card.component'; // adjust path if needed

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, CardListComponent, TopbarComponent],
  templateUrl: 'user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent {
  cards = Array.from({ length: 6 }).map((_, i) => ({
    id: i + 1,
    name: { en: 'Name', ar: 'يبتمشتيب' },
    role: 'Supervisor',
    phone: '0987654321',
    email: 'test@gmail.com',
    rate: '1200$',
    picture: '/assets/images/image.png',
  }));

  // Add this line so the template binding exists at runtime:
  profileCardComponent = ProfileCardComponent;
}
