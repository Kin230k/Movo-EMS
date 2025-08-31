import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemedButtonComponent } from '../../../../../components/shared/themed-button/themed-button';
import { AddProjectModalComponent } from './add-project-modal.component';
import { AddScheduleModalComponent } from './add-schedule-modal.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  imports: [
    CommonModule,
    ThemedButtonComponent,
    AddProjectModalComponent,
    AddScheduleModalComponent,
    TranslateModule,
  ],
  standalone: true,
})
export class TopbarComponent {
  @Input() projects: { id: string; name: { en: string; ar: string } }[] = [];
  @Output() projectCreated = new EventEmitter<any>();
  @Output() scheduleCreated = new EventEmitter<any>();

  showAddProject = false;
  showAddSchedule = false;

  openAddProject() {
    this.showAddProject = true;
  }

  openAddSchedule() {
    this.showAddSchedule = true;
  }

  onModalClose(closeReason?: any) {
    // closeReason can be used if needed
    this.showAddProject = false;
  }

  onScheduleModalClose(closeReason?: any) {
    this.showAddSchedule = false;
  }

  onProjectCreated(projectData: any) {
    // Handle project creation
    this.projectCreated.emit(projectData);
    console.log('New project created:', projectData);
    this.showAddProject = false;
  }

  onScheduleCreated(scheduleData: any) {
    // Handle schedule creation
    this.scheduleCreated.emit(scheduleData);
    console.log('New schedule created:', scheduleData);
    this.showAddSchedule = false;
  }
}
