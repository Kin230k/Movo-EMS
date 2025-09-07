import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Import TranslateModule and TranslateService
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import api from '../../../../../core/api/api';
import { LanguageService } from '../../../../../core/services/language.service';

@Component({
  selector: 'app-add-role-modal',
  templateUrl: './add-role-modal.component.html',
  styleUrls: ['./add-role-modal.component.scss'],
  // Add TranslateModule to imports for the pipe to work in the template
  imports: [CommonModule, FormsModule, TranslateModule],
  standalone: true,
})
export class AddRoleModalComponent {
  @Input() projects: { id: string; name: { en: string; ar: string } }[] = [];
  @Input() roles: { id: string; name: { en: string; ar: string } }[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() assigned = new EventEmitter<{
    userId: string;
    projectId: string;
    roleId: string;
  }>();

  email = '';
  checking = signal(false);
  checkSucceeded = false;
  errorMessage = signal('');
  selectedProjectId = signal('');
  selectedRoleId = signal('');
  isSubmitting = signal(false);
  userId = signal('');

  // Inject TranslateService in the constructor
  constructor(
    private translate: TranslateService,
    private language: LanguageService
  ) {}

  get currentLang() {
    return this.language.currentLang;
  }

  // Verify email via direct API calls
  async checkEmailAsync(email: string): Promise<boolean> {
    this.checking.set(true);
    this.errorMessage.set('');
    try {
      const data: any = await api.getUserInfoByEmail({ email });
      const payload = (data as any)?.result ?? data ?? {};
      console.log(this.roles);

      if (payload.success) {
        this.userId.set(payload.user.userId);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    } finally {
      this.checking.set(false);
    }
  }

  async onVerifyEmail() {
    if (!this.email) {
      // Use translate service for error messages
      this.errorMessage.set(
        this.translate.instant('ADD_ROLE_MODAL.ERRORS.EMAIL_REQUIRED')
      );
      return;
    }
    this.errorMessage.set('');
    const result = await this.checkEmailAsync(this.email);
    if (result) {
      this.checkSucceeded = true;
    } else {
      this.checkSucceeded = false;
      // Use translate service for error messages
      this.errorMessage.set(
        this.translate.instant('ADD_ROLE_MODAL.ERRORS.VERIFICATION_FAILED')
      );
    }
  }

  assignRole() {
    if (this.selectedProjectId() == null) {
      // Use translate service for error messages
      this.errorMessage.set(
        this.translate.instant('ADD_ROLE_MODAL.ERRORS.PROJECT_REQUIRED')
      );
      return;
    }
    if (this.selectedRoleId() == null) {
      // Use translate service for error messages
      this.errorMessage.set(
        this.translate.instant('ADD_ROLE_MODAL.ERRORS.ROLE_REQUIRED')
      );
      return;
    }
    this.isSubmitting.set(true);
    this.assigned.emit({
      userId: this.userId(),
      projectId: this.selectedProjectId() ?? '',
      roleId: this.selectedRoleId() ?? '',
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
