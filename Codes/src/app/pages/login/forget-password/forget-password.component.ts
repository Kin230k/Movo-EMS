import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { ThemedButtonComponent } from '../../../components/shared/themed-button/themed-button';
import { InputComponent } from '../../../components/shared/input/input';
import { LoadingSpinnerComponent } from '../../../components/shared/loading-spinner/loading-spinner.component';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [
    CommonModule,
    InputComponent,
    ThemedButtonComponent,
    LoadingSpinnerComponent,
    TranslateModule,
  ],
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss'],
})
export class ForgetPasswordComponent {
  email: string = '';
  isResetting = signal(false);

  constructor(
    private router: Router,
    private auth: AuthService,
    private toast: ToastService
  ) {}

  onEmailChange(value: string) {
    this.email = value;
  }

  async onResetPassword() {
    if (this.isResetting()) return;

    if (!this.email?.trim()) {
      this.toast.error('Please enter your email address');
      return;
    }

    this.isResetting.set(true);

    try {
      await this.auth.sendPasswordReset(this.email);
      this.toast.success(
        'Password reset email sent successfully. Please check your inbox.'
      );
    } catch (error: any) {
      console.error('Password reset failed:', error);
      this.toast.error(
        'Failed to send password reset email. Please try again.'
      );
    } finally {
      this.isResetting.set(false);
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
