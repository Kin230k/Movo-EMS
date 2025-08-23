import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: false,
})
export class SidebarComponent {
  collapsed = false;

  menu = [
    'Project Management',
    'Form Management',
    'Create Interview Questions',
    'Location Management',
    'User Management',
    'Send Emails',
    'View Records',
    'Client Data Management',
    'Permissions Management',
    'Attendance Management',
  ];

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }
}
