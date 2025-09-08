import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComboSelectorComponent } from '../../../../../components/shared/combo-selector/combo-selector.component';
import { TranslateModule } from '@ngx-translate/core';
import { CreateAttendanceModalComponent } from './create-attendance-modal.component';
import { ThemedButtonComponent } from '../../../../../components/shared/themed-button/themed-button';

@Component({
  selector: 'app-attendance-topbar',
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
  @Input() usersForSelector: {
    id: string | number;
    name: { en: string; ar: string };
    role?: string;
    picture?: string;
  }[] = [];
  @Input() areasForSelector: {
    id: string | number;
    name: { en: string; ar: string };
  }[] = [];

  @Output() projectSelected = new EventEmitter<string>();
  @Output() createAttendance = new EventEmitter<any>();
  @Output() refetch = new EventEmitter<void>();

  showCreateModal = false;

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

  handleModalRefetch() {
    this.refetch.emit();
  }
}
