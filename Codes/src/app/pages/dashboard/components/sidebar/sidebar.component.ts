// src/app/pages/dashboard/components/sidebar/sidebar.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ButtonComponent } from '../../../../components/shared/button/button';
import { ResponsiveService } from '../../../../core/services/responsive.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [CommonModule, RouterModule, ButtonComponent, TranslateModule], // <-- added TranslateModule
  standalone: true,
})
export class SidebarComponent implements OnInit, OnDestroy {
  collapsed = false; // collapsed = true => compact/hidden menu on desktop; on mobile toggles menu
  isMobile = false;
  private destroy$ = new Subject<void>();

  // explicit mapping label -> path (kebab-case paths used in your routes)
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
      path: 'create-form-questions',
    },
    { labelKey: 'SIDEBAR.LOCATION_MANAGEMENT', path: 'location-management' },
    { labelKey: 'SIDEBAR.SEND_EMAILS', path: 'send-emails' },
    { labelKey: 'SIDEBAR.VIEW_RECORDS', path: 'view-records' },
    {
      labelKey: 'SIDEBAR.CLIENT_DATA_MANAGEMENT',
      path: 'client-data-management',
    },
    {
      labelKey: 'SIDEBAR.PERMISSIONS_MANAGEMENT',
      path: 'permissions-management',
    },
  ];

  constructor(
    private router: Router,
    private responsive: ResponsiveService,
    private langService: LanguageService
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
}
