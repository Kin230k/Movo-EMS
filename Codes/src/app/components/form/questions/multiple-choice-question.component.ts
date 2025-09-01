import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormQuestionDto } from '../../../shared/types/form';

@Component({
  selector: 'app-multiple-choice-question',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="q-wrapper" [class.invalid]="invalid">
      <label class="q-label">{{ question.questionText }}</label>
      <div class="checkbox-group">
        <label *ngFor="let opt of question.options || []" class="checkbox-item">
          <input
            type="checkbox"
            [checked]="isChecked(opt.optionId)"
            (change)="toggle(opt.optionId, $event)"
          />
          <span>{{ opt.optionText }}</span>
        </label>
      </div>
      <div class="q-error" *ngIf="invalid">
        <span>This field is required.</span>
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
      .checkbox-group {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem 1rem;
      }
      .checkbox-item {
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
export class MultipleChoiceQuestionComponent {
  @Input() question!: FormQuestionDto;
  @Input() control!: FormControl;
  @Input() showErrors = false;

  get invalid(): boolean {
    const errs = this.control.errors;
    return !!(
      errs &&
      errs['required'] &&
      (this.control.touched || this.showErrors)
    );
  }

  isChecked(id: string): boolean {
    const value = (this.control.value as string[]) || [];
    return value.includes(id);
  }

  toggle(id: string, evt: Event) {
    const checked = (evt.target as HTMLInputElement).checked;
    const current = ((this.control.value as string[]) || []).slice();
    const idx = current.indexOf(id);
    if (checked && idx === -1) current.push(id);
    if (!checked && idx !== -1) current.splice(idx, 1);
    this.control.setValue(current);
    this.control.markAsDirty();
    this.control.markAsTouched();
    this.control.updateValueAndValidity();
  }
}
