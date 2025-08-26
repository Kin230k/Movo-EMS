import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComboSelectorComponent } from '../../../../../components/shared/combo-selector/combo-selector.component';
import { ThemedButtonComponent } from '../../../../../components/shared/themed-button/themed-button';
import { AddRoleModalComponent } from './add-role-modal.component'; // adjust path as needed

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  imports: [
    CommonModule,
    ComboSelectorComponent,
    ThemedButtonComponent,
    AddRoleModalComponent,
  ],
  standalone: true,
})
export class TopbarComponent {
  @Input() projects: { id: number; name: string }[] = [];
  @Output() projectSelected = new EventEmitter<number>();

  showAddRole = false;

  openAddRole() {
    this.showAddRole = true;
  }

  onModalClose(closeReason?: any) {
    // closeReason can be used if needed
    this.showAddRole = false;
  }

  onProjectAssigned(projectId: number) {
    // The modal emitted a project assignment (e.g., after mock async succeeded and user selected)
    this.projectSelected.emit(projectId);
    this.showAddRole = false;
  }
}
