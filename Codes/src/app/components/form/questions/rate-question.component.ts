import { Component, Input, Signal, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormQuestionDto } from '../../../shared/types/form';

@Component({
  selector: 'app-rate-question',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="q-wrapper"
      [class.invalid]="control.invalid && (control.touched || showErrors)"
    >
      <label class="q-label">{{ question.questionText }}</label>
      <div class="rate-group">
        <button
          type="button"
          class="rate-btn"
          *ngFor="let star of stars"
          [class.active]="control.value === star"
          (click)="select(star)"
        >
          {{ star }}
        </button>
      </div>
      <div
        class="q-error"
        *ngIf="control.errors && (control.touched || showErrors)"
      >
        <span *ngIf="control.errors['required']">This field is required.</span>
      </div>
    </div>
  `,
  styles: [
    `
      .q-wrapper {
        display: grid;
        gap: 0.5rem;
      }
      .q-label {
        font-weight: 600;
        color: var(--color-dark-text);
      }
      .rate-group {
        display: flex;
        gap: 0.5rem;
      }
      .rate-btn {
        background: rgba(var(--accent-rgb), 0.1);
        border: 1px solid rgba(var(--accent-rgb), 0.3);
        color: var(--accent);
        padding: 0.5rem 0.75rem;
        border-radius: 0.5rem;
        cursor: pointer;
      }
      .rate-btn.active {
        background: var(--accent);
        color: var(--white);
        border-color: var(--accent);
      }
      .q-error {
        color: var(--error);
        font-size: 0.85rem;
      }
      .invalid .rate-btn {
        border-color: var(--error);
      }
    `,
  ],
})
export class RateQuestionComponent {
  @Input() question!: FormQuestionDto;
  @Input() control!: FormControl;
  @Input() showErrors = false;

  get stars(): number[] {
    const min = this.question.min ?? 1;
    const max = this.question.max ?? 5;
    return Array.from({ length: max - min + 1 }, (_, i) => i + min);
  }

  select(value: number) {
    this.control.setValue(value);
    this.control.markAsDirty();
    this.control.markAsTouched();
  }
}
