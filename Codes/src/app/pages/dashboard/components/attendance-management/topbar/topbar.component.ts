import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComboSelectorComponent } from '../../../../../components/shared/combo-selector/combo-selector.component';
import { TranslateModule } from '@ngx-translate/core';
import { CreateAttendanceModalComponent } from './create-attendance-modal.component';
import { ThemedButtonComponent } from '../../../../../components/shared/themed-button/themed-button';

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
  @Input() projects: { id: number; name: { ar: string; en: string } }[] = [];

  @Output() projectSelected = new EventEmitter<number>();
  @Output() createAttendance = new EventEmitter<any>();

  showCreateModal = false;

  // Mocked data
  mockUsers = [
    {
      id: 1,
      name: { en: 'John Doe', ar: 'جون دو' },
      role: 'Engineer',
      picture: 'https://i.pravatar.cc/100?img=1',
    },
    {
      id: 2,
      name: { en: 'Jane Smith', ar: 'جين سميث' },
      role: 'Manager',
      picture: 'https://i.pravatar.cc/100?img=2',
    },
  ];

  mockAreas = [
    { id: 101, name: { en: 'Main Office', ar: 'المكتب الرئيسي' } },
    { id: 102, name: { en: 'Warehouse', ar: 'المستودع' } },
  ];

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
