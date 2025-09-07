import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComboSelectorComponent } from '../../../../../components/shared/combo-selector/combo-selector.component';
import { ThemedButtonComponent } from '../../../../../components/shared/themed-button/themed-button';
import { AddRoleModalComponent } from './add-role-modal.component'; // adjust path as needed
import { rolesDropDown } from '../../../../../shared/types/roles';
import { TranslateModule } from '@ngx-translate/core';
import api from '../../../../../core/api/api';
@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  imports: [
    CommonModule,
    ComboSelectorComponent,
    ThemedButtonComponent,
    AddRoleModalComponent,
    TranslateModule,
  ],
  standalone: true,
})
export class TopbarComponent {
  @Input() projects: { id: string; name: { en: string; ar: string } }[] = [];
  @Output() projectSelected = new EventEmitter<string>();

  showAddRole = false;

  roles = rolesDropDown;

  openAddRole() {
    this.showAddRole = true;
  }

  onModalClose() {
    this.showAddRole = false;
  }

  onProjectAssigned(projectId: string) {
    // The modal emitted a project assignment (e.g., after mock async succeeded and user selected)
    this.projectSelected.emit(projectId);
    this.showAddRole = false;
  }
  async onAssigned(payload: {
    projectId: string;
    roleId: string;
    userId: string;
  }) {
    const mutate = await api.createProjectUserRole({
      projectId: payload.projectId,
      roleId: payload.roleId,
      userId: payload.userId,
    });
    if (mutate.success) {
      this.onModalClose();
    }
  }
}
