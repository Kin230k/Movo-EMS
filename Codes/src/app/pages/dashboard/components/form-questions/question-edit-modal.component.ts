import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { questionTypes } from '../../../../shared/types/questionTypes';
import { conditionOptions } from '../../../../shared/types/conditionOptions';
import { ComboSelectorComponent } from '../../../../components/shared/combo-selector/combo-selector.component';

@Component({
  selector: 'app-question-edit-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ComboSelectorComponent,
  ],
  templateUrl: './question-edit-modal.component.html',
  styleUrls: ['./question-edit-modal.component.scss'],
})
export class QuestionEditModalComponent {
  @Input() visible = false;
  @Input() question!: FormGroup; // reference to the form group in parent
  @Input() conditionOptions: {
    id: string;
    name: { en: string; ar: string };
  }[] = conditionOptions;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  form: FormGroup;
  questionTypes = questionTypes;
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      text: ['', Validators.required],
      description: [''],
      type: ['', Validators.required],
      options: this.fb.array([]),
      criteria: this.fb.array([]),
    });
  }

  ngOnChanges() {
    if (this.question) {
      this.form.patchValue({
        text: this.question.get('text')?.value,
        description: this.question.get('description')?.value,
        type: this.question.get('type')?.value,
      });
      const options = this.question.get('options') as FormArray<FormGroup>;
      const editOptions = this.form.get('options') as FormArray<FormGroup>;
      while (editOptions.length > 0) editOptions.removeAt(0);
      options.controls.forEach((opt) => {
        editOptions.push(
          this.fb.group({
            optionText: [opt.get('optionText')?.value || ''],
            isCorrect: [!!opt.get('isCorrect')?.value],
          })
        );
      });

      const srcCriteria = this.question.get('criteria') as FormArray<FormGroup>;
      const editCriteria = this.form.get('criteria') as FormArray<FormGroup>;
      while (editCriteria.length > 0) editCriteria.removeAt(0);
      srcCriteria.controls.forEach((c) => {
        editCriteria.push(
          this.fb.group({
            condition: [c.get('condition')?.value || '=', Validators.required],
            value: [c.get('value')?.value || ''],
            valueTo: [c.get('valueTo')?.value || ''],
            effect: [c.get('effect')?.value || 'pass', Validators.required],
          })
        );
      });
    }
  }

  get optionsControls(): FormArray<FormGroup> {
    return this.form.get('options') as FormArray<FormGroup>;
  }

  addOption() {
    this.optionsControls.push(
      this.fb.group({ optionText: [''], isCorrect: [false] })
    );
  }

  removeOption(index: number) {
    this.optionsControls.removeAt(index);
  }

  onQuestionTypeSelect(selectedType: string | null) {
    const typeControl = this.form.get('type');
    if (selectedType) {
      typeControl?.setValue(selectedType);
    } else {
      typeControl?.setValue('');
    }
    typeControl?.markAsTouched();
    typeControl?.updateValueAndValidity({ onlySelf: true });
  }

  onConditionSelect(selectedCondition: string | null, criterion: FormGroup) {
    const criteria = this.form.get('criteria') as FormArray<FormGroup>;
    const idx = (criteria.controls as FormGroup[]).indexOf(criterion);
    if (idx === -1) return;
    const target = criteria.at(idx) as FormGroup;
    target.get('condition')?.setValue(selectedCondition ?? '');
  }

  onRadioChange(selectedOptionIndex: number) {
    // Set all options to false first, then set the selected one to true
    this.optionsControls.controls.forEach((opt, index) => {
      opt.get('isCorrect')?.setValue(index === selectedOptionIndex);
    });
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.form.value);
  }

  // Criteria helpers and filtering
  get criteriaControls(): FormArray<FormGroup> {
    return this.form.get('criteria') as FormArray<FormGroup>;
  }

  getPassCriteria(): FormGroup[] {
    return (this.criteriaControls.controls as FormGroup[]).filter(
      (c) => c.get('effect')?.value === 'pass'
    );
  }

  getFailCriteria(): FormGroup[] {
    return (this.criteriaControls.controls as FormGroup[]).filter(
      (c) => c.get('effect')?.value === 'fail'
    );
  }

  addCriteria(effect: 'pass' | 'fail') {
    this.criteriaControls.push(
      this.fb.group({
        condition: ['=', Validators.required],
        value: [''],
        valueTo: [''],
        effect: [effect, Validators.required],
      })
    );
  }

  removeCriteria(criterion: FormGroup | number) {
    if (typeof criterion === 'number') {
      this.criteriaControls.removeAt(criterion);
      return;
    }
    const criteria = this.criteriaControls;
    const idx = (criteria.controls as FormGroup[]).indexOf(criterion);
    if (idx >= 0) criteria.removeAt(idx);
  }

  getFilteredConditionOptions(questionType: string) {
    console.log(questionType);
    const textConditions = ['=', '!=', 'contains'];
    if (!Array.isArray(this.conditionOptions)) return [];
    switch (questionType) {
      case 'SHORT_ANSWER':
      case 'OPEN_ENDED':
        return this.conditionOptions.filter((o) =>
          textConditions.includes(o.id)
        );
      case 'NUMBER':
        return this.conditionOptions.filter(
          (o) => !textConditions.includes(o.id)
        );
      default:
        return this.conditionOptions;
    }
  }
}
