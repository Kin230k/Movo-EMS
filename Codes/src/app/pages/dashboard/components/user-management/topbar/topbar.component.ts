import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComboSelectorComponent } from '../../../../../components/shared/combo-selector/combo-selector.component';
import { ThemedButtonComponent } from '../../../../../components/shared/themed-button/themed-button';
import { AddRoleModalComponent } from './add-role-modal.component'; // adjust path as needed
import { rolesDropDown } from '../../../../../shared/types/roles';
import { ApiQueriesService } from '../../../../../core/services/queries.service';
import { TranslateModule } from '@ngx-translate/core';
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
  @Input() projects: { id: number; name: { en: string; ar: string } }[] = [];
  @Output() projectSelected = new EventEmitter<number>();

  showAddRole = false;

  roles = rolesDropDown;

  constructor(private apiQueries: ApiQueriesService) {}

  openAddRole() {
    this.showAddRole = true;
  }

  onModalClose() {
    this.showAddRole = false;
  }

  onProjectAssigned(projectId: number) {
    // The modal emitted a project assignment (e.g., after mock async succeeded and user selected)
    this.projectSelected.emit(projectId);
    this.showAddRole = false;
  }
  onAssigned(payload: { projectId: number; roleId: string }) {
    const mutate = this.apiQueries.createUserProjectMutation();
    mutate.mutate(
      {
        projectId: String(payload.projectId),
        roleId: String(payload.roleId),
      } as any,
      {
        onSuccess: () => {
          this.projectSelected.emit(payload.projectId);
          this.showAddRole = false;
        },
      } as any
    );
  }
}
