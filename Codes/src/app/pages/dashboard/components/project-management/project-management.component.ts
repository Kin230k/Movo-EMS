import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardListComponent } from '../../../../components/shared/card-list/card-list.component';
import { ProfileCardComponent } from './profile-card/profile-card.component';
import { CardListSkeletionComponent } from '../../../../components/shared/card-list-skeletion/card-list-skeletion.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-project-management',
  standalone: true,
  imports: [
    CommonModule,
    CardListComponent,
    CardListSkeletionComponent,
    TranslateModule,
  ],
  templateUrl: './project-management.component.html',
  styleUrls: ['./project-management.component.scss'],
})
export class ProjectManagementComponent {

  mockProjects = [{ projectId: 'slf', clientName: 'ojdflsjf',name: { en: 'Project A', ar: 'المشروع A' }, badgeBackground: 'red', startingDate: '2025-01-01', endingDate: '2025-01-01', description: { en: 'description', ar: 'description' } },
  { projectId: 'slf', clientName: 'ojdflsjf',name: { en: 'Project B', ar: 'المشروع B' }, badgeBackground: 'blue', startingDate: '2025-01-01', endingDate: '2025-01-01', description: { en: 'description', ar: 'description' } },
  { projectId: 'slf', clientName: 'ojdflsjf',name: { en: 'Project C', ar: 'المشروع C' }, badgeBackground: 'green', startingDate: '2025-01-01', endingDate: '2025-01-01', description: { en: 'description', ar: 'description' } },
  { projectId: 'slf', clientName: 'ojdflsjf',name: { en: 'Project D', ar: 'المشروع D' }, badgeBackground: 'yellow', startingDate: '2025-01-01', endingDate: '2025-01-01', description: { en: 'description', ar: 'description' } },
  { projectId: 'slf', clientName: 'ojdflsjf',name: { en: 'Project E', ar: 'المشروع E' }, badgeBackground: 'purple', startingDate: '2025-01-01', endingDate: '2025-01-01', description: { en: 'description', ar: 'description' } },
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
}
