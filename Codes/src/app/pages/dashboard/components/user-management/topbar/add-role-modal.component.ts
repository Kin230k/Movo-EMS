import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComboSelectorComponent } from '../../../../../components/shared/combo-selector/combo-selector.component';
// Import TranslateModule and TranslateService
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiQueriesService } from '../../../../../core/services/queries.service';

@Component({
  selector: 'app-add-role-modal',
  templateUrl: './add-role-modal.component.html',
  styleUrls: ['./add-role-modal.component.scss'],
  // Add TranslateModule to imports for the pipe to work in the template
  imports: [CommonModule, FormsModule, ComboSelectorComponent, TranslateModule],
  standalone: true,
})
export class AddRoleModalComponent {
  @Input() projects: { id: number; name: { en: string; ar: string } }[] = [];
  @Input() roles: { id: string; name: { en: string; ar: string } }[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() assigned = new EventEmitter<{
    projectId: number;
    roleId: string;
  }>();

  email = '';
  checking = false;
  checkSucceeded = false;
  errorMessage = '';
  selectedProjectId: number | null = null;
  selectedRoleId: string | null = null;

  // Inject TranslateService and ApiQueriesService in the constructor
  constructor(
    private translate: TranslateService,
    private apiQueries: ApiQueriesService
  ) {}

  // Verify email via queries service
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
      // Use translate service for error messages
      this.errorMessage = this.translate.instant(
        'ADD_ROLE_MODAL.ERRORS.EMAIL_REQUIRED'
      );
      return;
    }
    this.errorMessage = '';
    const result = await this.checkEmailAsync(this.email);
    if (result) {
      this.checkSucceeded = true;
    } else {
      this.checkSucceeded = false;
      // Use translate service for error messages
      this.errorMessage = this.translate.instant(
        'ADD_ROLE_MODAL.ERRORS.VERIFICATION_FAILED'
      );
    }
  }

  onProjectSelected(projectId: number) {
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
      // Use translate service for error messages
      this.errorMessage = this.translate.instant(
        'ADD_ROLE_MODAL.ERRORS.PROJECT_REQUIRED'
      );
      return;
    }
    if (this.selectedRoleId == null) {
      // Use translate service for error messages
      this.errorMessage = this.translate.instant(
        'ADD_ROLE_MODAL.ERRORS.ROLE_REQUIRED'
      );
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
