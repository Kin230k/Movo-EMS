import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardListComponent } from '../../../../components/shared/card-list/card-list.component';
import { ProfileCardComponent } from './profile-card/profile-card.component';
import { CardListSkeletionComponent } from '../../../../components/shared/card-list-skeletion/card-list-skeletion.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TopbarComponent } from './topbar/topbar.component';

@Component({
  selector: 'app-project-management',
  standalone: true,
  imports: [
    CommonModule,
    CardListComponent,
    CardListSkeletionComponent,
    TranslateModule,
    TopbarComponent,
  ],
  templateUrl: './project-management.component.html',
  styleUrls: ['./project-management.component.scss'],
})
export class ProjectManagementComponent {
  constructor(private translate: TranslateService) {}
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
      projectId: 'slf',
      clientName: 'ojdflsjf',
      name: { en: 'Project B', ar: 'المشروع B' },
      badgeBackground: 'blue',
      startingDate: '2025-01-01',
      endingDate: '2025-01-01',
      description: { en: 'description', ar: 'description' },
    },
    {
      projectId: 'slf',
      clientName: 'ojdflsjf',
      name: { en: 'Project C', ar: 'المشروع C' },
      badgeBackground: 'green',
      startingDate: '2025-01-01',
      endingDate: '2025-01-01',
      description: { en: 'description', ar: 'description' },
    },
    {
      projectId: 'slf',
      clientName: 'ojdflsjf',
      name: { en: 'Project D', ar: 'المشروع D' },
      badgeBackground: 'yellow',
      startingDate: '2025-01-01',
      endingDate: '2025-01-01',
      description: { en: 'description', ar: 'description' },
    },
    {
      projectId: 'slf',
      clientName: 'ojdflsjf',
      name: { en: 'Project E', ar: 'المشروع E' },
      badgeBackground: 'purple',
      startingDate: '2025-01-01',
      endingDate: '2025-01-01',
      description: { en: 'description', ar: 'description' },
    },
  ];

  profileCardComponent = ProfileCardComponent;

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

  private async fetchProjects(): Promise<any[]> {
    await new Promise((r) => setTimeout(r, 900));
    return this.mockProjects || [];
  }

  // Transform mockProjects to match topbar's expected interface
  get transformedProjects() {
    return this.mockProjects.map((project) => ({
      id: project.projectId, // Map projectId to id
      name: project.name, // Keep multilingual name object
    }));
  }

  onProjectCreated(projectData: any) {
    console.log('New project created:', projectData);
    // Add the new project to the mock projects array
    const newProject = {
      projectId: Date.now().toString(), // Generate a unique ID
      clientName: '', // You might want to add client selection to the modal
      name: { en: projectData.nameEn, ar: projectData.nameAr },
      badgeBackground: '#ff2d55', // Default badge color
      startingDate: projectData.startingDate,
      endingDate: projectData.endingDate,
      description: {
        en: projectData.descriptionEn,
        ar: projectData.descriptionAr,
      },
    };
    this.mockProjects = [...this.mockProjects, newProject];
  }
}
