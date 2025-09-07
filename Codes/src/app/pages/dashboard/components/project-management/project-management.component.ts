// project-management.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import {
  ScheduleCardComponent,
  ScheduleData,
} from './schedule-card/schedule-card.component';
import { CardListSkeletionComponent } from '../../../../components/shared/card-list-skeletion/card-list-skeletion.component';
import { IdentityService } from '../../../../core/services/identity.service';
import api from '../../../../core/api/api';
import { TopbarComponent } from './topbar/topbar.component';
import { AddScheduleModalComponent } from './topbar/add-schedule-modal.component';
import { ComboSelectorComponent } from '../../../../components/shared/combo-selector/combo-selector.component';
import { EditScheduleModalComponent } from './edit-schedule-modal/edit-schedule-modal.component';
import { DeleteModalComponent } from '../../../../components/shared/delete-modal/delete-modal.component';
import { ProfileModalComponent } from './profile-card/profile-modal/profile-modal.component';
import { ProfileCardComponent } from './profile-card/profile-card.component';

@Component({
  selector: 'app-project-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardListSkeletionComponent,
    TranslateModule,
    TopbarComponent,
    AddScheduleModalComponent,
    ScheduleCardComponent,
    ComboSelectorComponent,
    EditScheduleModalComponent,
    DeleteModalComponent,
    ProfileModalComponent,
    ProfileCardComponent,
  ],
  templateUrl: './project-management.component.html',
  styleUrls: ['./project-management.component.scss'],
})
export class ProjectManagementComponent {
  constructor(
    private translate: TranslateService,
    private identity: IdentityService
  ) {}

  activeTab: 'projects' | 'schedules' = 'projects';
  selectedProjectId: string = '';

  private _projects: any[] = [];
  private _schedules: any[] = [];
  private _isLoading = false;
  private _error: any = null;

  async ngOnInit() {
    const who = await this.identity.getIdentity().catch(() => null);
    try {
      this._isLoading = true;
      if (who?.isClient) {
        const data: any = await api.getProjectsByClient({});
        const payload = (data as any)?.result ?? data ?? {};
        this._projects = Array.isArray(payload.projects)
          ? payload.projects
          : [];
      } else {
        const data: any = await api.getAllProjects();
        const payload = (data as any)?.result ?? data ?? {};
        this._projects = Array.isArray(payload.projects)
          ? payload.projects
          : [];
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      this._error = error;
      this._projects = [];
    } finally {
      this._isLoading = false;
    }
  }

  get mockProjects() {
    return this._projects.map((p: any) => ({
      ...p,
      name: p.name,
    }));
  }

  // Stable transformed projects array for combo selector
  get transformedProjects(): {
    id: string;
    name: { en: string; ar: string };
  }[] {
    return (this.mockProjects || []).map((p: any) => ({
      id: p.projectId,
      name: p.name,
    }));
  }

  schedules: ScheduleData[] = [];

  scheduleCardComponent = ScheduleCardComponent;

  // Modal states
  showAddSchedule = false;
  showEditSchedule = false;
  showDeleteSchedule = false;
  showProfileModal = false;
  selectedSchedule: ScheduleData | null = null;
  selectedProjectData: any = null;

  get isLoading() {
    return this._isLoading;
  }
  get error(): any {
    return this._error;
  }
  get isFinished() {
    return !this._isLoading && !this._error;
  }

  get filteredSchedules(): ScheduleData[] {
    if (!this.selectedProjectId) {
      return [];
    }
    const proj = (this.mockProjects || []).find(
      (p: any) => p.projectId === this.selectedProjectId
    );
    const projectName = proj?.name;
    return this._schedules
      .filter((s: any) => s.projectId === this.selectedProjectId)
      .map((s: any) => ({
        scheduleId: s.scheduleId ?? s.id ?? `${s.projectId}-${s.startTime}`,
        projectId: s.projectId,
        startDateTime: s.startTime ?? s.startDateTime,
        endDateTime: s.endTime ?? s.endDateTime,
        createdAt: s.createdAt ?? new Date().toISOString(),
        projectName,
      }));
  }

  get selectedProject() {
    return (this.mockProjects || []).find(
      (project: any) => project.projectId === this.selectedProjectId
    );
  }

  private async setupSchedules(projectId: string): Promise<void> {
    try {
      const data: any = await api.getSchedulesByProjectOrLocation({
        projectId,
      });
      const payload = (data as any)?.result ?? data ?? {};
      this._schedules = Array.isArray(payload.schedules)
        ? payload.schedules
        : [];
    } catch (error) {
      console.error('Error loading schedules:', error);
      this._schedules = [];
    } finally {
      this._isLoading = false;
    }
  }

  async onProjectSelected(projectId: string | null) {
    this.selectedProjectId = projectId ?? '';
    if (this.selectedProjectId) {
      this._isLoading = true;
      await this.setupSchedules(this.selectedProjectId);
    } else {
      this._schedules = [];
    }
  }

  setActiveTab(tab: 'projects' | 'schedules') {
    this.activeTab = tab;
  }

  // Schedule edit methods
  onScheduleEdit(schedule: ScheduleData) {
    this.selectedSchedule = schedule;
    this.showEditSchedule = true;
  }

  /**
   * Convert a "datetime-local" (YYYY-MM-DDTHH:mm) into an ISO string by constructing
   * a Date from local components. This preserves the wall-clock time the user selected,
   * then returns the corresponding UTC ISO instant.
   */
  private localDatetimeToISOString(local: string): string {
    // local expected shape "YYYY-MM-DDTHH:mm" (seconds optional)
    const [datePart, timePart = '00:00'] = local.split('T');
    const [y, m, d] = datePart.split('-').map((v) => Number(v));
    const [hh, mm] = timePart.split(':').map((v) => Number(v));
    // Construct using local components so the Date represents the local moment.
    return new Date(y, m - 1, d, hh || 0, mm || 0).toISOString();
  }

  async onScheduleEditUpdate(updateData: {
    scheduleId: string;
    startDateTime: string;
    endDateTime: string;
  }) {
    try {
      const result = await api.updateSchedule({
        scheduleId: updateData.scheduleId,
        projectId: this.selectedProjectId, // Add required projectId
        startTime: this.localDatetimeToISOString(updateData.startDateTime), // ensure ISO string
        endTime: this.localDatetimeToISOString(updateData.endDateTime), // ensure ISO string
      });

      if ((result as any).success) {
        console.log(
          this.translate.instant('PROJECT_MANAGEMENT.SCHEDULE_UPDATED')
        );
        // Refresh schedules after update
        if (this.selectedProjectId) {
          await this.setupSchedules(this.selectedProjectId);
        }
      } else {
        console.error((result as any).error);
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
    this.showEditSchedule = false;
    this.selectedSchedule = null;
  }

  onScheduleEditClose() {
    this.showEditSchedule = false;
    this.selectedSchedule = null;
  }

  // Schedule delete methods
  onScheduleDelete(schedule: ScheduleData) {
    this.selectedSchedule = schedule;
    this.showDeleteSchedule = true;
  }

  async onScheduleDeleteConfirm() {
    if (this.selectedSchedule) {
      try {
        const result = await api.deleteSchedule({
          scheduleId: this.selectedSchedule.scheduleId,
        });

        if ((result as any).success) {
          console.log(
            this.translate.instant('PROJECT_MANAGEMENT.SCHEDULE_DELETED')
          );
          // Refresh schedules after delete
          if (this.selectedProjectId) {
            await this.setupSchedules(this.selectedProjectId);
          }
        } else {
          console.error((result as any).error);
        }
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
    this.showDeleteSchedule = false;
    this.selectedSchedule = null;
  }

  onScheduleDeleteClose() {
    this.showDeleteSchedule = false;
    this.selectedSchedule = null;
  }

  // Add schedule methods
  openAddSchedule() {
    this.showAddSchedule = true;
  }

  onScheduleModalClose() {
    this.showAddSchedule = false;
  }

  // Refetch methods for modals to call after operations
  async refetchProjects(): Promise<void> {
    const who = await this.identity.getIdentity().catch(() => null);
    try {
      this._isLoading = true;
      if (who?.isClient) {
        const data: any = await api.getProjectsByClient({});
        const payload = (data as any)?.result ?? data ?? {};
        this._projects = Array.isArray(payload.projects)
          ? payload.projects
          : [];
      } else {
        const data: any = await api.getAllProjects();
        const payload = (data as any)?.result ?? data ?? {};
        this._projects = Array.isArray(payload.projects)
          ? payload.projects
          : [];
      }
    } catch (error) {
      console.error('Error refetching projects:', error);
      this._error = error;
    } finally {
      this._isLoading = false;
    }
  }

  async refetchSchedules(): Promise<void> {
    if (this.selectedProjectId) {
      await this.setupSchedules(this.selectedProjectId);
    }
  }

  async refetchAll(): Promise<void> {
    await this.refetchProjects();
    await this.refetchSchedules();
  }

  // Profile modal methods
  onProfileEdit(projectData: any) {
    console.log('Opening profile modal for project:', projectData);
    this.selectedProjectData = projectData;
    this.showProfileModal = true;
  }

  onProfileModalClose() {
    this.showProfileModal = false;
    this.selectedProjectData = null;
  }

  async onProfileModalEdit(updateData: any) {
    console.log('Updating project with data:', updateData);
    try {
      await api.updateProject(updateData);
      console.log('Project updated successfully');
      this.onProfileModalClose();
      // Refresh projects
      await this.refetchProjects();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  }

  displayProjectName(arg0: { en: string; ar: string }) {
    const lang =
      this.translate.currentLang === 'ar' ||
      document.documentElement.dir === 'rtl'
        ? 'ar'
        : 'en';
    return arg0[lang] ?? arg0['en'] ?? arg0['ar'] ?? '';
  }
}
