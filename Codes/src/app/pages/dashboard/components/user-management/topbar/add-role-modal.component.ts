import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComboSelectorComponent } from '../../../../../components/shared/combo-selector/combo-selector.component'; // adjust path
import { ThemedButtonComponent } from '../../../../../components/shared/themed-button/themed-button'; // optional reuse

@Component({
  selector: 'app-add-role-modal',
  templateUrl: './add-role-modal.component.html',
  styleUrls: ['./add-role-modal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ComboSelectorComponent,
    ThemedButtonComponent,
  ],
  standalone: true,
})
export class AddRoleModalComponent {
  @Input() projects: { id: number; name: string }[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() projectAssigned = new EventEmitter<number>();

  email = '';
  checking = false;
  checkSucceeded = false;
  errorMessage = '';
  selectedProjectId: number | null = null;

  // Mock async check — returns Promise<boolean>
  // For the mock, we'll resolve true for emails that contain "@" and false otherwise.
  async checkEmailAsync(email: string): Promise<boolean> {
    this.checking = true;
    this.errorMessage = '';
    try {
      // simulate network latency
      await new Promise((r) => setTimeout(r, 900));
      // simple mock rule:
      const ok = typeof email === 'string' && email.includes('@');
      return ok;
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
      this.errorMessage = 'Email verification failed (mock).';
    }
  }

  onProjectSelected(projectId: number) {
    this.selectedProjectId = projectId;
  }

  assignRole() {
    if (this.selectedProjectId == null) {
      this.errorMessage = 'Please select a project.';
      return;
    }
    // In real app, call backend to assign role. Here we just emit event.
    this.projectAssigned.emit(this.selectedProjectId);
  }

  onClose() {
    this.close.emit();
  }
}
