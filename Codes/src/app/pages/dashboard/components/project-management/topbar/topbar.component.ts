import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemedButtonComponent } from '../../../../../components/shared/themed-button/themed-button';
import { AddProjectModalComponent } from './add-project-modal.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  imports: [
    CommonModule,
    ThemedButtonComponent,
    AddProjectModalComponent,
    TranslateModule,
  ],
  standalone: true,
})
export class TopbarComponent {
  @Input() projects: { id: string; name: { en: string; ar: string } }[] = [];
  @Output() projectCreated = new EventEmitter<any>();

  showAddProject = false;

  openAddProject() {
    this.showAddProject = true;
  }

  onModalClose(closeReason?: any) {
    // closeReason can be used if needed
    this.showAddProject = false;
  }

  onProjectCreated(projectData: any) {
    // Handle project creation
    this.projectCreated.emit(projectData);
    console.log('New project created:', projectData);
    this.showAddProject = false;
  }
}
