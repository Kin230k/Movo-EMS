import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { InputComponent } from '../../components/shared/input/input';
import { ThemedButtonComponent } from '../../components/shared/themed-button/themed-button';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';
import { ImageUploadService } from '../../core/services/image-upload.service';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup-user',
  standalone: true,
  imports: [
    CommonModule,
    InputComponent,
    ThemedButtonComponent,
    TranslateModule,
  ],
  providers: [],
  template: `
    <div
      class="toast"
      *ngIf="showToast"
      [class.success]="toastType === 'success'"
      [class.error]="toastType === 'error'"
    >
      {{ toastMessage }}
    </div>
    <div class="logo">
      <img src="../../../assets/images/logo.png" alt="" />
    </div>

    <div class="login-container">
      <div class="login-form">
        <h2 class="login-title">{{ 'SIGNUP.TITLE' | translate }}</h2>

        <form (submit)="onSignUp($event)">
          <app-input
            type="text"
            [placeholder]="'SIGNUP.NAME_EN' | translate"
            [value]="nameEn"
            (valueChange)="onNameEnChange($event)"
          ></app-input>

          <app-input
            type="text"
            [placeholder]="'SIGNUP.NAME_AR' | translate"
            [value]="nameAr"
            (valueChange)="onNameArChange($event)"
          ></app-input>

          <app-input
            type="email"
            [placeholder]="'SIGNUP.EMAIL_PLACEHOLDER' | translate"
            [value]="email"
            (valueChange)="onEmailChange($event)"
          ></app-input>

          <app-input
            type="password"
            [placeholder]="'SIGNUP.PASSWORD_PLACEHOLDER' | translate"
            [value]="password"
            (valueChange)="onPasswordChange($event)"
          ></app-input>

          <app-input
            type="password"
            [placeholder]="'SIGNUP.CONFIRM_PASSWORD' | translate"
            [value]="confirmPassword"
            (valueChange)="onConfirmPasswordChange($event)"
          ></app-input>

          <div class="file-upload">
            <input
              id="file"
              type="file"
              (change)="onFileSelected($event)"
              accept="image/*"
              hidden
              #fileInput
            />
            <themed-button
              type="button"
              (onClick)="fileInput.click()"
              [text]="'SIGNUP.UPLOAD_PICTURE' | translate"
            ></themed-button>

            <div class="upload-info" *ngIf="uploadProgress > 0">
              <span>{{ uploadProgress }}%</span>
            </div>

            <img
              *ngIf="pictureURL"
              [src]="pictureURL"
              class="preview"
              alt="preview"
            />
          </div>

          <div class="forgot-password">
            <a (click)="goToForgetPassword()">{{
              'SIGNUP.FORGET_PASSWORD' | translate
            }}</a>
          </div>

          <themed-button
            type="submit"
            [text]="'SIGNUP.BUTTON' | translate"
          ></themed-button>

          <div class="switch-login-type">
            <a (click)="goToLogin()">{{
              'SIGNUP.SWITCH_TO_LOGIN' | translate
            }}</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .toast {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 1000;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        color: #ffffff;
        background: rgba(0, 0, 0, 0.85);
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
        max-width: 320px;
        animation: fadein 150ms ease-out;
      }

      .toast.success {
        background: linear-gradient(135deg, #22c55e, #16a34a);
      }

      .toast.error {
        background: linear-gradient(135deg, #ef4444, #b91c1c);
      }

      @keyframes fadein {
        from {
          opacity: 0;
          transform: translateY(-6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .login-container {
        min-height: 80vh;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .login-form {
        background-color: var(--bg-dark);
        padding: 3rem;
        border-radius: var(--radius-form);
        color: var(--color-font);
        width: 100%;
        max-width: 26rem;
        box-shadow: 0 4px 12px var(--shadow-login);
      }

      .logo {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        margin-bottom: 1.5rem;
      }

      h1 {
        color: var(--secondary);
        margin: 0;
        font-size: 2.2rem;
        text-align: center;
        letter-spacing: 1px;
        font-weight: bold;
      }

      .login-title {
        color: rgba(var(--secondary-rgb), 0.9);
        margin: 0 0 2rem 0;
        font-size: 1.5rem;
        text-align: center;
        font-weight: 400;
      }

      .forget-password {
        text-align: right;
        margin: -0.5rem 0 1.5rem 0;
      }

      .forget-password a {
        color: var(--secondary);
        text-decoration: none;
        font-size: 0.9rem;
      }

      .forget-password a:hover {
        text-decoration: underline;
        cursor: pointer;
      }

      .switch-login-type {
        text-align: center;
        margin: 1.5rem 0 0 0;
      }

      .switch-login-type a {
        color: var(--btn-color);
        text-decoration: none;
        font-size: 0.9rem;
      }

      .switch-login-type a:hover {
        text-decoration: underline;
        cursor: pointer;
      }

      /* التأكد من أن حقول الإدخال تأخذ العرض الكامل */
      app-input {
        display: block;
        width: 100%;
        margin-bottom: 1.5rem;
      }

      /* التأكد من أن الأزرار تأخذ العرض الكامل */
      themed-button {
        display: block;
        width: 100%;
      }

      .file-upload {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .upload-info {
        font-size: 0.9rem;
      }

      .preview {
        display: block;
        width: 64px;
        height: 64px;
        object-fit: cover;
        border-radius: 8px;
      }

      @media (max-width: 1024px) {
        .login-form {
          padding: 2.5rem;
          max-width: 24rem;
        }

        h1 {
          font-size: 2rem;
        }

        .login-title {
          font-size: 1.4rem;
          margin-bottom: 2rem;
        }
      }

      @media (max-width: 768px) {
        .login-form {
          padding: 2rem;
          max-width: 22rem;
        }

        h1 {
          font-size: 1.8rem;
        }

        .login-title {
          font-size: 1.3rem;
          margin-bottom: 1.8rem;
        }
      }

      @media (max-width: 480px) {
        .login-container {
          padding: 0.5rem;
        }

        .login-form {
          padding: 1.5rem;
          margin: 0 0.5rem;
        }

        h1 {
          font-size: 1.6rem;
        }

        .login-title {
          font-size: 1.2rem;
          margin-bottom: 1.5rem;
        }

        .logo {
          margin-bottom: 1.2rem;
        }

        .logo img {
          max-width: 100px;
        }

        .forget-password {
          margin: -0.5rem 0 1.2rem 0;
        }

        .forget-password a {
          font-size: 0.85rem;
        }

        .switch-login-type {
          margin: 1.2rem 0 0 0;
        }

        .switch-login-type a {
          font-size: 0.85rem;
        }
      }

      @media (max-width: 360px) {
        .login-form {
          padding: 1.2rem;
        }

        h1 {
          font-size: 1.4rem;
        }

        .login-title {
          font-size: 1.1rem;
          margin-bottom: 1.2rem;
        }

        .forget-password {
          margin: -0.3rem 0 1rem 0;
        }

        .switch-login-type {
          margin: 1rem 0 0 0;
        }
      }
    `,
  ],
})
export class SignUpUser {
  nameEn: string = '';
  nameAr: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  isSubmitting: boolean = false;

  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  private toastTimer?: any;

  pictureFile?: File;
  uploadProgress: number = 0;
  pictureURL?: string;

  constructor(
    private router: Router,
    private langService: LanguageService,
    private imageUpload: ImageUploadService,
    private authService: AuthService
  ) {}

  switchLanguage(lang: 'en' | 'ar') {
    this.langService.use(lang);
  }

  onNameEnChange(value: string) {
    this.nameEn = value;
  }

  onNameArChange(value: string) {
    this.nameAr = value;
  }

  onEmailChange(value: string) {
    this.email = value;
  }

  onPasswordChange(value: string) {
    this.password = value;
  }

  onConfirmPasswordChange(value: string) {
    this.confirmPassword = value;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.pictureFile = file;

    // upload and track progress
    const sub = this.imageUpload.uploadFile(file).subscribe({
      next: (progress) => {
        if (progress.downloadURL) {
          this.pictureURL = progress.downloadURL;
          this.uploadProgress = 100;
        } else {
          this.uploadProgress = progress.progress;
        }
      },
      error: (err) => {
        console.error('Upload error', err);
        this.triggerToast('Image upload failed', 'error');
      },
      complete: () => {
        // completed
      },
    });

    // no explicit unsubscribe here — consumer can navigate away or you can capture `sub` to cancel on destroy if needed
  }

  async onSignUp(event?: Event) {
    if (event) event.preventDefault();
    if (this.isSubmitting) return;

    if (!this.email || !this.password) {
      this.triggerToast('Please fill email and password', 'error');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.triggerToast('Passwords do not match', 'error');
      return;
    }

    this.isSubmitting = true;
    try {
      const picture = this.pictureURL ?? '';
      const credential = await this.authService.register(
        this.email,
        this.password,
        {
          en: this.nameEn,
          ar: this.nameAr,
        },
        picture
      );

      console.log('Registered', credential);
      // navigate to login after successful register
      this.triggerToast('Registered successfully', 'success');
      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Registration failed', error);
      this.triggerToast(
        'Registration failed: ' + (error?.message ?? error),
        'error'
      );
    } finally {
      this.isSubmitting = false;
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToAdminLogin() {
    this.router.navigate(['/login/admin']);
  }

  goToForgetPassword() {
    this.router.navigate(['/forget-password']);
  }

  private triggerToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
