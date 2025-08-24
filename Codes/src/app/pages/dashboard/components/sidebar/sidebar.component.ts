// src/app/pages/dashboard/components/sidebar/sidebar.component.ts
import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ButtonComponent } from '../../../../components/shared/button/button';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [CommonModule, RouterModule, ButtonComponent],
  standalone: true,
})
export class SidebarComponent implements OnInit {
  collapsed = false; // collapsed = true => compact/hidden menu on desktop; on mobile toggles menu
  isMobile = false;

  // explicit mapping label -> path (kebab-case paths used in your routes)
  menu = [
    { label: 'Project Management', path: 'project-management' },
    { label: 'Form Management', path: 'form-management' },
    { label: 'Create Interview Questions', path: 'create-interview-questions' },
    { label: 'Location Management', path: 'location-management' },
    { label: 'User Management', path: 'user-management' },
    { label: 'Send Emails', path: 'send-emails' },
    { label: 'View Records', path: 'view-records' },
    { label: 'Client Data Management', path: 'client-data-management' },
    { label: 'Permissions Management', path: 'permissions-management' },
    { label: 'Attendance Management', path: 'attendance-management' },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.onResize(); // set initial isMobile
    // auto-collapse menu on navigation for mobile UX
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        if (this.isMobile) this.collapsed = true;
      });
  }

  toggleSidebar() {
    // If mobile: toggle show/hide; if desktop: toggle collapsed compact mode
    this.collapsed = !this.collapsed;
  }

  onNavigate() {
    // called from click on <a> — ensure menu collapses on mobile
    if (this.isMobile) this.collapsed = true;
  }

  @HostListener('window:resize')
  onResize() {
    // breakpoint: 768px (change if you prefer)
    this.isMobile = window.innerWidth <= 768;
    // on entering mobile view, collapse the menu by default
    if (this.isMobile) {
      this.collapsed = true;
    } else {
      // on desktop restore expanded state by default
      this.collapsed = false;
    }
  }
}
