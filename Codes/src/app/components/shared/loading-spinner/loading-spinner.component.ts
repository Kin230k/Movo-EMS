import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-container" [class.inline]="inline">
      <div class="spinner"></div>
      <div *ngIf="label" class="label">{{ label }}</div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .spinner-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        padding: 1rem;
      }
      .spinner-container.inline {
        display: inline-flex;
        padding: 0;
      }
      .label {
        color: var(--color-dark-text);
        opacity: 0.8;
        font-weight: 500;
      }
      .spinner {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid rgba(var(--accent-rgb), 0.2);
        border-top-color: var(--accent);
        animation: spin 0.9s linear infinite;
        box-shadow: 0 0 12px rgba(var(--shadow-dark), 0.2);
      }
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class LoadingSpinnerComponent {
  @Input() label = '';
  @Input() inline = false;
}
