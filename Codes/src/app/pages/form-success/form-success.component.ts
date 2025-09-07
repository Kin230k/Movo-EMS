import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-form-success',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="success-container">
      <div class="success-card">
        <div class="success-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
            />
            <path
              d="M8 12l2 2 4-4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <h1 class="success-title">{{ 'FORM_SUCCESS.TITLE' | translate }}</h1>

        <p class="success-message">
          {{ 'FORM_SUCCESS.MESSAGE' | translate }}
        </p>

        <div class="email-notice">
          <p>{{ 'FORM_SUCCESS.EMAIL_NOTICE' | translate }}</p>
        </div>

        <button class="btn-primary" (click)="goHome()">
          {{ 'FORM_SUCCESS.BUTTON_HOME' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .success-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
      }

      .success-card {
        background: var(--bg-dark);
        border-radius: var(--radius-form);
        padding: 3rem;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        width: 100%;
        border: 1px solid rgba(var(--secondary-rgb), 0.2);
      }

      .success-icon {
        margin-bottom: 2rem;
      }

      .success-icon svg {
        width: 80px;
        height: 80px;
        color: var(--accent);
        animation: checkmark 0.8s ease-in-out;
      }

      @keyframes checkmark {
        0% {
          transform: scale(0) rotate(-180deg);
          opacity: 0;
        }
        50% {
          transform: scale(1.2) rotate(-90deg);
          opacity: 0.8;
        }
        100% {
          transform: scale(1) rotate(0deg);
          opacity: 1;
        }
      }

      .success-title {
        color: var(--color-font);
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
        animation: fadeInUp 0.6s ease-out 0.3s both;
      }

      .success-message {
        color: rgba(255, 255, 255, 0.9);
        font-size: 1.1rem;
        line-height: 1.6;
        margin-bottom: 2rem;
        animation: fadeInUp 0.6s ease-out 0.5s both;
      }

      .email-notice {
        background: rgba(var(--accent-rgb), 0.1);
        border: 1px solid rgba(var(--accent-rgb), 0.3);
        border-radius: var(--radius-btn);
        padding: 1.5rem;
        margin-bottom: 2rem;
        animation: fadeInUp 0.6s ease-out 0.7s both;
      }

      .email-icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }

      .email-notice p {
        color: var(--color-font);
        margin: 0;
        font-weight: 500;
      }

      .btn-primary {
        background: var(--accent);
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: var(--radius-btn);
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        animation: fadeInUp 0.6s ease-out 0.9s both;
      }

      .btn-primary:hover {
        background: var(--btn-hover-color);
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(var(--accent-rgb), 0.3);
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 768px) {
        .success-container {
          padding: 1rem;
        }

        .success-card {
          padding: 2rem;
        }

        .success-title {
          font-size: 1.5rem;
        }

        .success-message {
          font-size: 1rem;
        }
      }
    `,
  ],
})
export class FormSuccessComponent {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/projects']);
  }
}
