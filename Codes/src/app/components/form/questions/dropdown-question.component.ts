import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormQuestionDto } from '../../../shared/types/form';

@Component({
  selector: 'app-dropdown-question',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="q-wrapper"
      [class.invalid]="control.invalid && (control.touched || showErrors)"
    >
      <label class="q-label">{{ question.questionText }}</label>
      <select
        class="q-input"
        [formControl]="control"
        [disabled]="disabled"
        (blur)="control.markAsTouched()"
      >
        <option value="" disabled selected>Select...</option>
        <option
          *ngFor="let opt of question.options || []"
          [value]="opt.optionId"
        >
          {{ opt.optionText }}
        </option>
      </select>
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
      .q-input {
        padding: 0.75rem 1rem;
        border-radius: var(--radius-input);
        border: 1px solid rgba(var(--shadow-dark), 0.15);
        background: rgba(var(--white-rgb), 0.9);
        color: var(--color-text);
      }

      .q-input:focus {
        outline: 2px solid var(--accent);
        border-color: var(--accent);
      }
      .q-error {
        color: var(--error);
        font-size: 0.85rem;
      }
      .invalid .q-input {
        border-color: var(--error);
      }
    `,
  ],
})
export class DropdownQuestionComponent {
  @Input() question!: FormQuestionDto;
  @Input() control!: FormControl;
  @Input() showErrors = false;
  @Input() disabled = false;
}
