import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ComboSelectorComponent } from '../../../../components/shared/combo-selector/combo-selector.component';

@Component({
  selector: 'app-question-create-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ComboSelectorComponent,
  ],
  templateUrl: './question-create-modal.component.html',
  styleUrls: ['./question-create-modal.component.scss'],
})
export class QuestionCreateModalComponent {
  @Input() visible = false;
  @Input() questionTypes: { id: string; name: { en: string; ar: string } }[] =
    [];
  @Input() conditionOptions:
    | { id: string; name: { en: string; ar: string } }[]
    | [] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any[]>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      items: this.fb.array([this.createItemGroup()]),
    });
  }

  get items(): FormArray<FormGroup> {
    return this.form.get('items') as FormArray<FormGroup>;
  }

  createItemGroup(): FormGroup {
    return this.fb.group({
      text: ['', Validators.required],
      description: [''],
      type: ['', Validators.required],
      options: this.fb.array([]),
      criteria: this.fb.array([]),
    });
  }

  addItem() {
    this.items.push(this.createItemGroup());
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  getOptionsControls(index: number): FormArray<FormGroup> {
    return this.items.at(index).get('options') as FormArray<FormGroup>;
  }

  addOption(index: number) {
    this.getOptionsControls(index).push(
      this.fb.group({ optionText: [''], isCorrect: [false] })
    );
  }

  removeOption(index: number, optionIndex: number) {
    this.getOptionsControls(index).removeAt(optionIndex);
  }

  // Criteria helpers
  getCriteriaControls(index: number): FormArray<FormGroup> {
    return this.items.at(index).get('criteria') as FormArray<FormGroup>;
  }

  addCriteria(index: number, effect: 'pass' | 'fail') {
    this.getCriteriaControls(index).push(
      this.fb.group({
        condition: ['=', Validators.required],
        value: [''],
        valueTo: [''],
        effect: [effect, Validators.required],
      })
    );
  }

  removeCriteria(index: number, ci: number | FormGroup) {
    const criteria = this.getCriteriaControls(index);
    if (typeof ci === 'number') {
      criteria.removeAt(ci);
      return;
    }
    const idx = (criteria.controls as FormGroup[]).indexOf(ci);
    if (idx >= 0) criteria.removeAt(idx);
  }

  getPassCriteria(index: number): FormGroup[] {
    return (this.getCriteriaControls(index).controls as FormGroup[]).filter(
      (c) => c.get('effect')?.value === 'pass'
    );
  }

  getFailCriteria(index: number): FormGroup[] {
    return (this.getCriteriaControls(index).controls as FormGroup[]).filter(
      (c) => c.get('effect')?.value === 'fail'
    );
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

  onClose() {
    this.close.emit();
  }

  onQuestionTypeSelect(selectedType: string | null, itemIndex: number) {
    const item = this.items.at(itemIndex);
    const typeControl = item.get('type');
    if (selectedType) {
      typeControl?.setValue(selectedType);
    } else {
      typeControl?.setValue('');
    }
    typeControl?.markAsTouched();
    typeControl?.updateValueAndValidity({ onlySelf: true });
  }

  onConditionSelect(
    selectedCondition: string | null,
    itemIndex: number,
    criterion: FormGroup
  ) {
    const criteria = this.getCriteriaControls(itemIndex);
    const idx = (criteria.controls as FormGroup[]).indexOf(criterion);
    if (idx === -1) return;
    const target = criteria.at(idx) as FormGroup;
    target.get('condition')?.setValue(selectedCondition ?? '');
  }

  onRadioChange(itemIndex: number, selectedOptionIndex: number) {
    const options = this.getOptionsControls(itemIndex);

    // Set all options to false first, then set the selected one to true
    options.controls.forEach((opt, index) => {
      opt.get('isCorrect')?.setValue(index === selectedOptionIndex);
    });
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.form.value.items);
  }
}
