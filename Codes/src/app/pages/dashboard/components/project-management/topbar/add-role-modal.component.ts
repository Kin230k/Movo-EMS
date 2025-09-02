import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComboSelectorComponent } from '../../../../../components/shared/combo-selector/combo-selector.component';
import { ApiQueriesService } from '../../../../../core/services/queries.service';

@Component({
  selector: 'app-add-role-modal',
  templateUrl: './add-role-modal.component.html',
  styleUrls: ['./add-role-modal.component.scss'],
  imports: [CommonModule, FormsModule, ComboSelectorComponent],
  standalone: true,
})
export class AddRoleModalComponent {
  @Input() projects: { id: string; name: { en: string; ar: string } }[] = [];
  @Input() roles: { id: string; name: { en: string; ar: string } }[] = []; // new input for roles
  @Output() close = new EventEmitter<void>();
  // Emit object containing selected project and role
  @Output() assigned = new EventEmitter<{
    projectId: string;
    roleId: string;
  }>();

  email = '';
  checking = false;
  checkSucceeded = false;
  errorMessage = '';
  selectedProjectId: string | null = null;
  selectedRoleId: string | null = null; // new

  constructor(private apiQueries: ApiQueriesService) {}

  // Verify email via queries
  async checkEmailAsync(email: string): Promise<boolean> {
    this.checking = true;
    this.errorMessage = '';
    try {
      const q = this.apiQueries.getUserInfoByEmailQuery({ email });
      const user = q?.data?.();
      return !!user;
    } finally {
      this.checking = false;
    }
  }

  async onVerifyEmail() {
    if (!this.email) {
      this.errorMessage = 'Please enter an email.';
      return;
    }
    this.errorMessage = '';
    const result = await this.checkEmailAsync(this.email);
    if (result) {
      this.checkSucceeded = true;
    } else {
      this.checkSucceeded = false;
      this.errorMessage = 'Email not found.';
    }
  }

  onProjectSelected(projectId: string) {
    this.selectedProjectId = projectId;
    this.errorMessage = '';
  }

  onRoleSelected(event: Event) {
    const t = event.target as HTMLSelectElement;
    this.selectedRoleId = t.value ? t.value : null;
    this.errorMessage = '';
  }

  assignRole() {
    if (this.selectedProjectId == null) {
      this.errorMessage = 'Please select a project.';
      return;
    }
    if (this.selectedRoleId == null) {
      this.errorMessage = 'Please select a role.';
      return;
    }
    this.assigned.emit({
      projectId: this.selectedProjectId,
      roleId: this.selectedRoleId,
    });
  }

  onClose() {
    this.close.emit();
  }
}
