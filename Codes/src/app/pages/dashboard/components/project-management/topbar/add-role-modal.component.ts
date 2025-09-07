import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComboSelectorComponent } from '../../../../../components/shared/combo-selector/combo-selector.component';
import api from '../../../../../core/api/api';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-role-modal',
  templateUrl: './add-role-modal.component.html',
  styleUrls: ['./add-role-modal.component.scss'],
  imports: [CommonModule, FormsModule, ComboSelectorComponent, TranslateModule],
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
  checking = signal(false);
  checkSucceeded = false;
  errorMessage = signal('');
  selectedProjectId: string | null = null;
  selectedRoleId: string | null = null; // new
  isSubmitting = signal(false);

  constructor() {}

  // Verify email via direct API calls
  async checkEmailAsync(email: string): Promise<boolean> {
    this.checking.set(true);
    this.errorMessage.set('');
    try {
      const data: any = await api.getUserInfoByEmail({ email });
      const payload = (data as any)?.result ?? data ?? {};
      return payload?.success ?? false;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    } finally {
      this.checking.set(false);
    }
  }

  async onVerifyEmail() {
    if (!this.email) {
      this.errorMessage.set('Please enter an email.');
      return;
    }
    this.errorMessage.set('');
    const result = await this.checkEmailAsync(this.email);
    if (result) {
      this.checkSucceeded = true;
    } else {
      this.checkSucceeded = false;
      this.errorMessage.set('Email not found.');
    }
  }

  onProjectSelected(projectId: string) {
    this.selectedProjectId = projectId;
    this.errorMessage.set('');
  }

  onRoleSelected(event: Event) {
    const t = event.target as HTMLSelectElement;
    this.selectedRoleId = t.value ? t.value : null;
    this.errorMessage.set('');
  }

  assignRole() {
    if (this.selectedProjectId == null) {
      this.errorMessage.set('Please select a project.');
      return;
    }
    if (this.selectedRoleId == null) {
      this.errorMessage.set('Please select a role.');
      return;
    }
    this.isSubmitting.set(true);
    this.assigned.emit({
      projectId: this.selectedProjectId,
      roleId: this.selectedRoleId,
    });
    // Simulate async operation - parent component should handle loading state
    setTimeout(() => {
      this.isSubmitting.set(false);
    }, 1000);
  }

  onClose() {
    this.close.emit();
  }
}
