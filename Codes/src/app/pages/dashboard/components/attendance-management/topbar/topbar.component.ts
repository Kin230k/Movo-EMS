import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComboSelectorComponent } from '../../../../../components/shared/combo-selector/combo-selector.component';
import { TranslateModule } from '@ngx-translate/core';
import { CreateAttendanceModalComponent } from './create-attendance-modal.component';
import { ThemedButtonComponent } from '../../../../../components/shared/themed-button/themed-button';
import { ApiQueriesService } from '../../../../../core/services/queries.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  imports: [
    CommonModule,
    ComboSelectorComponent,
    TranslateModule,
    CreateAttendanceModalComponent,
    ThemedButtonComponent,
  ],
  standalone: true,
})
export class TopbarComponent {
  @Input() projects: { id: string; name: { ar: string; en: string } }[] = [];
  @Input() selectedProjectId: string | null = null;

  @Output() projectSelected = new EventEmitter<string>();
  @Output() createAttendance = new EventEmitter<any>();

  showCreateModal = false;
  constructor(private apiQueries: ApiQueriesService) {}

  get usersForSelector() {
    if (!this.selectedProjectId) return [];
    const q = this.apiQueries.getProjectUsersQuery({
      projectId: String(this.selectedProjectId),
    });
    const data = q.data?.() ?? [];
    return Array.isArray(data)
      ? data.map((u: any, idx: number) => ({
          id: u.userId ?? u.id ?? idx + 1,
          name: u.name ?? {
            en: u.displayName ?? 'User',
            ar: u.displayName ?? 'User',
          },
          role: u.role ?? 'User',
          picture: u.picture ?? '/assets/images/image.png',
        }))
      : [];
  }

  get areasForSelector() {
    const q = this.apiQueries.getAllAreasQuery();
    const data = q.data?.() ?? [];
    return Array.isArray(data)
      ? data.map((a: any, idx: number) => ({
          id: a.areaId ?? a.id ?? idx + 1,
          name: a.name,
        }))
      : [];
  }

  openCreateModal() {
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  handleCreateAttendance(payload: any) {
    this.createAttendance.emit(payload);
    this.showCreateModal = false;
  }
}
