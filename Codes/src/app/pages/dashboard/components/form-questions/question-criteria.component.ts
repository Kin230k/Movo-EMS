import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ComboSelectorComponent } from '../../../../components/shared/combo-selector/combo-selector.component';
@Component({
  selector: 'app-question-criteria',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ComboSelectorComponent,
  ],
  templateUrl: './question-criteria.component.html',
  styleUrls: ['./question-criteria.component.scss'],
})
export class QuestionCriteriaComponent {
  // receive the full question FormGroup (bind with [formGroup] in the parent)
  @Input() question!: FormGroup;
  @Input() questionIndex!: number;
  @Input() conditionOptions: {
    id: string;
    name: { en: string; ar: string };
  }[] = [];
  @Input() showInputs: boolean = true;
  @Input() addCriteria!: (
    questionIndex: number,
    effect: 'PASS' | 'FAIL'
  ) => void;
  @Input() removeCriteria!: (questionIndex: number, idx: number) => void;

  // convenience getters
  get criteria(): FormArray<FormGroup> {
    return this.question.get('criteria') as FormArray<FormGroup>;
  }

  // Get filtered criteria by effect
  getPassCriteria(): FormGroup[] {
    console.log('getPassCriteria', this.criteria.value);
    return this.criteria.controls.filter(
      (c) => c.get('effect')?.value === 'PASS'
    ) as FormGroup[];
  }

  getFailCriteria(): FormGroup[] {
    console.log('getPassCriteria', this.criteria.value);
    return this.criteria.controls.filter(
      (c) => c.get('effect')?.value === 'FAIL'
    ) as FormGroup[];
  }

  onConditionSelect(event: any) {
    this.criteria.at(this.questionIndex).get('condition')?.setValue(event);
  }
}
