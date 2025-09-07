// src/app/pages/auth/signup-user.component.ts
import { Component, inject, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ThemedButtonComponent } from '../../components/shared/themed-button/themed-button';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';
import { ImageUploadService } from '../../core/services/image-upload.service';
import api from '../../core/api/api';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

export type Multilingual = { en: string; ar: string };

@Component({
  selector: 'app-signup-user',
  standalone: true,
  imports: [
    CommonModule,
    ThemedButtonComponent,
    TranslateModule,
    ReactiveFormsModule,
  ],
  template: `
    <div
      class="toast"
      *ngIf="showToast()"
      [class.success]="toastType() === 'success'"
      [class.error]="toastType() === 'error'"
    >
      {{ toastMessage() }}
    </div>
    <div class="logo">
      <img src="../../../assets/images/logo.png" alt="" />
    </div>

    <div class="login-container">
      <div class="login-form" [class.loading]="isSubmitting()">
        <!-- overlay spinner shown while submitting -->
        <div
          class="overlay"
          *ngIf="isSubmitting()"
          aria-live="polite"
          aria-busy="true"
        >
          <div class="spinner" role="status" aria-hidden="true"></div>
          <div class="overlay-msg">{{ 'SIGNUP.CREATING' | translate }}</div>
        </div>

        <h2 class="login-title">{{ 'SIGNUP.TITLE' | translate }}</h2>

        <form [formGroup]="form" (ngSubmit)="onSignUp()">
          <div class="grid two-col">
            <input
              type="text"
              [placeholder]="'SIGNUP.NAME_EN' | translate"
              formControlName="nameEn"
            />

            <input
              type="text"
              [placeholder]="'SIGNUP.NAME_AR' | translate"
              formControlName="nameAr"
            />
          </div>

          <input
            type="email"
            [placeholder]="'SIGNUP.EMAIL_PLACEHOLDER' | translate"
            formControlName="email"
            class="email"
          />

          <div class="grid two-col">
            <input
              type="password"
              [placeholder]="'SIGNUP.PASSWORD_PLACEHOLDER' | translate"
              formControlName="password"
            />

            <input
              type="password"
              [placeholder]="'SIGNUP.CONFIRM_PASSWORD' | translate"
              formControlName="confirmPassword"
            />
          </div>

          <div class="file-upload dropzone">
            <input
              id="file"
              type="file"
              (change)="onFileSelected($event)"
              accept="image/*"
              hidden
              #fileInput
            />
            <div class="btn-upload-logo" (click)="fileInput.click()">
              {{ 'SIGNUP.UPLOAD_PICTURE' | translate }}
            </div>

            <div class="upload-info" *ngIf="uploadProgress() >= 0">
              <span>{{ uploadProgress() }}%</span>
            </div>

            <img
              *ngIf="pictureURL()"
              [src]="pictureURL()"
              class="preview"
              alt="profile picture preview"
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
            <a (click)="goToClient()">
              {{ 'SIGNUP.SWITCH_TO_CLIENT' | translate }}
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      /* original styles (updated to match) */
      * {
        box-sizing: border-box;
      }
      input {
        padding: 0.7rem;
        border-radius: 1.1rem;
        border: 1px solid #ccc;
        font-size: 1rem;
        width: 100%;
      }
      .btn-upload-logo {
        cursor: pointer;
        width: 100%;
      }

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
        max-width: 36rem;
        box-shadow: 0 4px 12px var(--shadow-login);
        position: relative; /* required for overlay */
        overflow: hidden;
      }

      .login-form.loading {
        opacity: 0.9;
      }

      .overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 0.75rem;
        background: rgba(0, 0, 0, 0.45);
        z-index: 50;
        pointer-events: all;
      }

      .overlay-msg {
        color: #ffffff;
        font-weight: 500;
        font-size: 0.95rem;
      }

      .spinner {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 4px solid rgba(255, 255, 255, 0.15);
        border-top-color: #ffffff;
        animation: spin 900ms linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
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

      .forgot-password {
        text-align: right;
        margin: -0.5rem 0 1.5rem 0;
      }

      .forgot-password a {
        color: var(--secondary);
        text-decoration: none;
        font-size: 0.9rem;
      }

      .forgot-password a:hover {
        text-decoration: underline;
        cursor: pointer;
      }

      .switch-login-type {
        text-align: center;
        margin: 1.5rem 0 0 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
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

      .file-upload {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .file-upload.dropzone {
        margin-top: 1rem;
        padding: 1rem;
        border: 2px dashed rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.03);
        transition: border-color 150ms ease, background-color 150ms ease;
      }

      .file-upload.dropzone:hover {
        border-color: rgba(var(--secondary-rgb), 0.6);
        background: rgba(255, 255, 255, 0.06);
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

      .grid {
        display: grid;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      @media (min-width: 1024px) {
        .two-col {
          grid-template-columns: 1fr 1fr;
        }
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

        .forgot-password {
          margin: -0.5rem 0 1.2rem 0;
        }

        .forgot-password a {
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

        .forgot-password {
          margin: -0.3rem 0 1rem 0;
        }

        .switch-login-type {
          margin: 1rem 0 0 0;
        }
      }
      .email {
        margin-bottom: 1rem;
      }
    `,
  ],
})
export class SignUpUser implements OnDestroy {
  // services via inject()
  private router = inject(Router);
  private langService = inject(LanguageService);
  private imageUpload = inject(ImageUploadService);
  private authService = inject(AuthService);
  // Reactive form
  form = new FormGroup({
    nameEn: new FormControl('', Validators.required),
    nameAr: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
    confirmPassword: new FormControl('', Validators.required),
    picture: new FormControl(''),
  });

  // UI state as signals
  isSubmitting = signal(false);
  showToast = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');

  uploadProgress = signal<number>(-1);
  pictureURL = signal<string | undefined>(undefined);

  private subs: Subscription[] = [];
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    // If you want to initialize defaults, do it here.
  }

  switchLanguage(lang: 'en' | 'ar') {
    this.langService.use(lang);
  }

  // file selection & upload
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // reset progress
    this.uploadProgress.set(0);

    const uploadSub = this.imageUpload.uploadFile(file).subscribe({
      next: (progress) => {
        // progress object assumed: { progress: number } and on completion { downloadURL: string }
        if ((progress as any).downloadURL) {
          const url = (progress as any).downloadURL as string;
          this.pictureURL.set(url);
          this.uploadProgress.set(100);
          // write to the form value
          this.form.patchValue({ picture: url });
        } else if (typeof (progress as any).progress === 'number') {
          this.uploadProgress.set((progress as any).progress);
        }
      },
      error: (err) => {
        console.error('Upload error', err);
        this.triggerToast('Image upload failed', 'error');
        this.uploadProgress.set(-1);
      },
      complete: () => {
        // completed
      },
    });

    this.subs.push(uploadSub);
  }

  async onSignUp() {
    if (this.isSubmitting()) return;

    // mark controls as touched to show validation state if used
    this.form.markAllAsTouched();

    // simple validation
    if (!this.form.value.email || !this.form.value.password) {
      this.triggerToast('Please fill email and password', 'error');
      return;
    }

    if (this.form.value.password !== this.form.value.confirmPassword) {
      this.triggerToast('Passwords do not match', 'error');
      return;
    }

    this.isSubmitting.set(true);

    try {
      // Create user data in the format expected by the API
      const userData = {
        name: {
          en: this.form.value.nameEn ?? '',
          ar: this.form.value.nameAr ?? '',
        },
        picture: this.form.value.picture ?? '',
      };

      const result = await this.authService.register(
        this.form.value.email ?? '',
        this.form.value.password ?? '',
        userData.name,
        userData.picture
      );
      console.log('Registered', result);
      this.triggerToast('Registered successfully', 'success');
      // navigate after success
      this.router.navigate(['/projects']);
    } catch (error: any) {
      console.error('Registration failed', error);
      this.triggerToast(
        'Registration failed: ' + (error?.message ?? String(error)),
        'error'
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToForgetPassword() {
    this.router.navigate(['/forget-password']);
  }

  goToClient() {
    this.router.navigate(['/signup/client']);
  }

  private triggerToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this.showToast.set(false);
    }, 3000);
  }

  ngOnDestroy(): void {
    // unsubscribe any subscriptions (e.g., upload)
    this.subs.forEach((s) => s.unsubscribe());
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
  }
}
