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
  cards = Array.from({ length: 6 }).map((_, i) => ({
    userId: i + 1,
    name: { en: 'Name', ar: 'يبتمشتيب' },
    role: 'Main User',
    picture: '/assets/images/image.png',
    isPresent: true,
    attendanceTimestamp: new Date(),
  }));

  // Add this line so the template binding exists at runtime:
  attendanceCardComponent = AttendanceProfileCardComponent;
}
