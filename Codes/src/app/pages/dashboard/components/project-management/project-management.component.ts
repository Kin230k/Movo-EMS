import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardListComponent } from '../../../../components/shared/card-list/card-list.component';
import { ProfileCardComponent } from './profile-card/profile-card.component';
import {
  ScheduleCardComponent,
  ScheduleData,
} from './schedule-card/schedule-card.component';
import { CardListSkeletionComponent } from '../../../../components/shared/card-list-skeletion/card-list-skeletion.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TopbarComponent } from './topbar/topbar.component';
import { AddScheduleModalComponent } from './topbar/add-schedule-modal.component';
import { ComboSelectorComponent } from '../../../../components/shared/combo-selector/combo-selector.component';
import { EditScheduleModalComponent } from './edit-schedule-modal/edit-schedule-modal.component';
import { DeleteModalComponent } from '../../../../components/shared/delete-modal/delete-modal.component';

@Component({
  selector: 'app-project-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardListComponent,
    CardListSkeletionComponent,
    TranslateModule,
    TopbarComponent,
    AddScheduleModalComponent,
    ScheduleCardComponent,
    ComboSelectorComponent,
    EditScheduleModalComponent,
    DeleteModalComponent,
  ],
  templateUrl: './project-management.component.html',
  styleUrls: ['./project-management.component.scss'],
})
export class ProjectManagementComponent {
  constructor(private translate: TranslateService) {}

  activeTab: 'projects' | 'schedules' = 'projects';
  selectedProjectId: string = '';

  mockProjects = [
    {
      projectId: 'slf',
      clientName: 'ojdflsjf',
      name: { en: 'Project A', ar: 'المشروع A' },
      badgeBackground: 'red',
      startingDate: '2025-01-01',
      endingDate: '2025-01-01',
      description: { en: 'description', ar: 'description' },
    },
    {
      projectId: 'slf2',
      clientName: 'ojdflsjf',
      name: { en: 'Project B', ar: 'المشروع B' },
      badgeBackground: 'blue',
      startingDate: '2025-01-01',
      endingDate: '2025-01-01',
      description: { en: 'description', ar: 'description' },
    },
    {
      projectId: 'slf3',
      clientName: 'ojdflsjf',
      name: { en: 'Project C', ar: 'المشروع C' },
      badgeBackground: 'green',
      startingDate: '2025-01-01',
      endingDate: '2025-01-01',
      description: { en: 'description', ar: 'description' },
    },
    {
      projectId: 'slf4',
      clientName: 'ojdflsjf',
      name: { en: 'Project D', ar: 'المشروع D' },
      badgeBackground: 'yellow',
      startingDate: '2025-01-01',
      endingDate: '2025-01-01',
      description: { en: 'description', ar: 'description' },
    },
    {
      projectId: 'slf5',
      clientName: 'ojdflsjf',
      name: { en: 'Project E', ar: 'المشروع E' },
      badgeBackground: 'purple',
      startingDate: '2025-01-01',
      endingDate: '2025-01-01',
      description: { en: 'description', ar: 'description' },
    },
  ];

  // Stable transformed projects array for combo selector
  transformedProjects: { id: string; name: { en: string; ar: string } }[] =
    this.mockProjects.map((p) => ({ id: p.projectId, name: p.name }));

  // Mock schedules data
  mockSchedules: ScheduleData[] = [
    {
      scheduleId: 'schedule-1',
      projectId: 'slf',
      startDateTime: '2025-01-15T09:00:00',
      endDateTime: '2025-01-15T17:00:00',
      createdAt: '2025-01-10T10:00:00',
      projectName: { en: 'Project A', ar: 'المشروع A' },
    },
    {
      scheduleId: 'schedule-2',
      projectId: 'slf',
      startDateTime: '2025-01-16T10:00:00',
      endDateTime: '2025-01-16T18:00:00',
      createdAt: '2025-01-11T11:00:00',
      projectName: { en: 'Project A', ar: 'المشروع A' },
    },
    {
      scheduleId: 'schedule-3',
      projectId: 'slf2',
      startDateTime: '2025-01-20T08:00:00',
      endDateTime: '2025-01-20T16:00:00',
      createdAt: '2025-01-12T12:00:00',
      projectName: { en: 'Project B', ar: 'المشروع B' },
    },
    {
      scheduleId: 'schedule-4',
      projectId: 'slf3',
      startDateTime: '2025-01-25T09:30:00',
      endDateTime: '2025-01-25T17:30:00',
      createdAt: '2025-01-13T13:00:00',
      projectName: { en: 'Project C', ar: 'المشروع C' },
    },
  ];

  profileCardComponent = ProfileCardComponent;
  scheduleCardComponent = ScheduleCardComponent;

  // Modal states
  showAddSchedule = false;
  showEditSchedule = false;
  showDeleteSchedule = false;
  selectedSchedule: ScheduleData | null = null;

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

  get filteredSchedules(): ScheduleData[] {
    if (!this.selectedProjectId) {
      return [];
    }
    return this.mockSchedules.filter(
      (schedule) => schedule.projectId === this.selectedProjectId
    );
  }

  get selectedProject() {
    return this.mockProjects.find(
      (project) => project.projectId === this.selectedProjectId
    );
  }

  private async fetchProjects(): Promise<any[]> {
    await new Promise((r) => setTimeout(r, 900));
    return this.mockProjects || [];
  }

  onProjectCreated(projectData: any) {
    const newProject = {
      projectId: Date.now().toString(),
      clientName: 'New Client',
      name: {
        en: projectData.nameEn,
        ar: projectData.nameAr,
      },
      badgeBackground: 'blue',
      startingDate: projectData.startingDate,
      endingDate: projectData.endingDate,
      description: {
        en: projectData.descriptionEn,
        ar: projectData.descriptionAr,
      },
    };
    this.mockProjects = [...this.mockProjects, newProject];
    // keep transformed list in sync
    this.transformedProjects = [
      ...this.transformedProjects,
      { id: newProject.projectId, name: newProject.name },
    ];
  }

  onScheduleCreated(scheduleData: any) {
    console.log('New schedule created:', scheduleData);
    const selectedProject = this.mockProjects.find(
      (p) => p.projectId === scheduleData.projectId
    );
    const newSchedule: ScheduleData = {
      scheduleId: Date.now().toString(),
      projectId: scheduleData.projectId,
      startDateTime: scheduleData.startDateTime,
      endDateTime: scheduleData.endDateTime,
      createdAt: new Date().toISOString(),
      projectName: selectedProject?.name,
    };
    this.mockSchedules = [...this.mockSchedules, newSchedule];
  }

  onProjectSelected(projectId: string | null) {
    this.selectedProjectId = projectId ?? '';
  }

  setActiveTab(tab: 'projects' | 'schedules') {
    this.activeTab = tab;
  }

  // Schedule edit methods
  onScheduleEdit(schedule: ScheduleData) {
    this.selectedSchedule = schedule;
    this.showEditSchedule = true;
  }

  onScheduleEditUpdate(updateData: {
    scheduleId: string;
    startDateTime: string;
    endDateTime: string;
  }) {
    const scheduleIndex = this.mockSchedules.findIndex(
      (s) => s.scheduleId === updateData.scheduleId
    );
    if (scheduleIndex !== -1) {
      this.mockSchedules[scheduleIndex] = {
        ...this.mockSchedules[scheduleIndex],
        startDateTime: updateData.startDateTime,
        endDateTime: updateData.endDateTime,
      };
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

  onScheduleDeleteConfirm() {
    if (this.selectedSchedule) {
      this.mockSchedules = this.mockSchedules.filter(
        (s) => s.scheduleId !== this.selectedSchedule!.scheduleId
      );
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
  displayProjectName(arg0: { en: string; ar: string }) {
    const lang =
      this.translate.currentLang === 'ar' ||
      document.documentElement.dir === 'rtl'
        ? 'ar'
        : 'en';
    return arg0[lang] ?? arg0['en'] ?? arg0['ar'] ?? '';
  }
}
