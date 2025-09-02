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
import { ApiQueriesService } from '../../../../core/services/queries.service';
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
  constructor(
    private translate: TranslateService,
    private apiQueries: ApiQueriesService
  ) {}

  activeTab: 'projects' | 'schedules' = 'projects';
  selectedProjectId: string = '';

  projectsQuery: any;
  schedulesQuery: any | null = null;

  ngOnInit() {
    this.projectsQuery = this.apiQueries.getAllProjectsQuery();
  }

  get mockProjects() {
    return this.projectsQuery.data() ?? [];
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

  profileCardComponent = ProfileCardComponent;
  scheduleCardComponent = ScheduleCardComponent;

  // Modal states
  showAddSchedule = false;
  showEditSchedule = false;
  showDeleteSchedule = false;
  selectedSchedule: ScheduleData | null = null;

  get isLoading() {
    return this.projectsQuery.isLoading();
  }
  get error(): any {
    return this.projectsQuery.error();
  }
  get isFinished() {
    return this.projectsQuery.isSuccess();
  }

  get filteredSchedules(): ScheduleData[] {
    if (!this.selectedProjectId) {
      return [];
    }
    const raw = this.schedulesQuery?.data?.() ?? [];
    const proj = (this.mockProjects || []).find(
      (p: any) => p.projectId === this.selectedProjectId
    );
    const projectName = proj?.name;
    return Array.isArray(raw)
      ? raw
          .filter((s: any) => s.projectId === this.selectedProjectId)
          .map((s: any) => ({
            scheduleId: s.scheduleId ?? s.id ?? `${s.projectId}-${s.startTime}`,
            projectId: s.projectId,
            startDateTime: s.startTime ?? s.startDateTime,
            endDateTime: s.endTime ?? s.endDateTime,
            createdAt: s.createdAt ?? new Date().toISOString(),
            projectName,
          }))
      : [];
  }

  get selectedProject() {
    return (this.mockProjects || []).find(
      (project: any) => project.projectId === this.selectedProjectId
    );
  }

  private setupSchedulesQuery(projectId: string): void {
    this.schedulesQuery = this.apiQueries.getSchedulesByProjectOrLocationQuery({
      projectId,
    });
  }

  onProjectCreated(_projectData: any) {
    // Project creation handled by modal via API; the projects query invalidates automatically.
    // Optionally, force a refetch if available.
    if (this.projectsQuery?.refetch) {
      this.projectsQuery.refetch();
    }
  }

  onScheduleCreated(scheduleData: any) {
    const mutate = this.apiQueries.createScheduleMutation();
    mutate.mutate(
      {
        startTime: scheduleData.startDateTime,
        endTime: scheduleData.endDateTime,
        projectId: scheduleData.projectId,
        locationId: scheduleData.locationId,
      },
      {
        onSuccess: () => this.schedulesQuery?.refetch?.(),
      } as any
    );
  }

  onProjectSelected(projectId: string | null) {
    this.selectedProjectId = projectId ?? '';
    if (this.selectedProjectId) {
      this.setupSchedulesQuery(this.selectedProjectId);
    } else {
      this.schedulesQuery = null;
      this.schedules = [];
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

  onScheduleEditUpdate(updateData: {
    scheduleId: string;
    startDateTime: string;
    endDateTime: string;
  }) {
    const mutate = this.apiQueries.updateScheduleMutation();
    mutate.mutate(
      {
        scheduleId: updateData.scheduleId,
        startTime: updateData.startDateTime,
        endTime: updateData.endDateTime,
      },
      {
        onSuccess: () => this.schedulesQuery?.refetch?.(),
      } as any
    );
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
      const mutate = this.apiQueries.deleteScheduleMutation();
      mutate.mutate({ scheduleId: this.selectedSchedule.scheduleId }, {
        onSuccess: () => this.schedulesQuery?.refetch?.(),
      } as any);
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
