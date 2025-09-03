// src/app/pages/dashboard/components/sidebar/sidebar.component.ts
import { Subject } from 'rxjs';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter, takeUntil } from 'rxjs/operators';
import { ButtonComponent } from '../../../../components/shared/button/button';
import { ResponsiveService } from '../../../../core/services/responsive.service';
import { IdentityService } from '../../../../core/services/identity.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [CommonModule, RouterModule, ButtonComponent, TranslateModule],
  standalone: true,
})
export class SidebarComponent implements OnInit, OnDestroy {
  collapsed = false;
  isMobile = false;
  private destroy$ = new Subject<void>();

  menu = [
    { labelKey: 'SIDEBAR.USER_MANAGEMENT', path: 'user-management' },
    {
      labelKey: 'SIDEBAR.ATTENDANCE_MANAGEMENT',
      path: 'attendance-management',
    },
    { labelKey: 'SIDEBAR.PROJECT_MANAGEMENT', path: 'project-management' },
    { labelKey: 'SIDEBAR.FORM_MANAGEMENT', path: 'form-management' },
    {
      labelKey: 'SIDEBAR.CREATE_FORM_QUESTIONS',
      path: 'create-questions',
    },
    { labelKey: 'SIDEBAR.INTERVIEW', path: 'interview' },
    { labelKey: 'SIDEBAR.LOCATION_MANAGEMENT', path: 'location-management' },
    { labelKey: 'SIDEBAR.SEND_EMAILS', path: 'send-emails' },
    { labelKey: 'SIDEBAR.VIEW_SUBMISSIONS', path: 'view-submissions' },
    {
      labelKey: 'SIDEBAR.CLIENT_DATA_MANAGEMENT',
      path: 'client-data-management',
    },
    // {
    //   labelKey: 'SIDEBAR.PERMISSIONS_MANAGEMENT',
    //   path: 'permissions-management',
    // },
  ];

  constructor(
    private router: Router,
    private responsive: ResponsiveService,
    private identity: IdentityService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    // subscribe to global isMobile
    this.responsive.isMobile$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isMobile) => {
        this.isMobile = isMobile;
        // default collapse behavior on entering mobile
        this.collapsed = isMobile ? true : false;
      });

    // auto-collapse menu on navigation for mobile UX
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.isMobile) this.collapsed = true;
      });

    // hide client-data-management entry for clients
    this.identity.getIdentity().then((who) => {
      if (who?.isClient) {
        this.menu = this.menu.filter(
          (item) => item.path !== 'client-data-management'
        );
      }
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async signOut() {
    await this.auth.logout();
    this.identity.resetIdentity();
    this.router.navigate(['/login']);
  }
}
