import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormQuestionDto } from '../../../shared/types/form';

@Component({
  selector: 'app-radio-question',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="q-wrapper"
      [class.invalid]="control.invalid && (control.touched || showErrors)"
    >
      <label class="q-label">{{ question.questionText }}</label>
      <div class="radio-group">
        <label *ngFor="let opt of question.options || []" class="radio-item">
          <input
            type="radio"
            [value]="opt.optionId"
            [formControl]="control"
            [disabled]="disabled"
          />
          <span>{{ opt.optionText }}</span>
        </label>
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
      .radio-group {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem 1rem;
      }
      .radio-item {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0.5rem;
        border-radius: 0.5rem;
        background: rgba(var(--shadow-dark), 0.03);
      }
      .q-error {
        color: var(--error);
        font-size: 0.85rem;
      }
    `,
  ],
})
export class RadioQuestionComponent {
  @Input() question!: FormQuestionDto;
  @Input() control!: FormControl;
  @Input() showErrors = false;
  @Input() disabled = false;
}
