import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { QuestionCriteriaComponent } from './question-criteria.component';
import { ComboSelectorComponent } from '../../../../components/shared/combo-selector/combo-selector.component';
@Component({
  selector: 'app-create-form-questions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    QuestionCriteriaComponent,
    ComboSelectorComponent,
  ],
  templateUrl: './create-form-questions.component.html',
  styleUrls: ['./create-form-questions.component.scss'],
})
export class CreateFormQuestionsComponent {
  onOptionChange(questionIndex: number, optionIndex: number, event: Event) {
    const options = this.getOptionsArray(questionIndex);
    const questionType = this.questions.at(questionIndex).get('type')?.value;
    const isChecked = (event.target as HTMLInputElement).checked;

    if (questionType === 'Radio' && isChecked) {
      // For radio buttons: deselect all other options when one is selected
      options.controls.forEach((option, index) => {
        option.get('isCorrect')?.setValue(index === optionIndex);
      });
    } else {
      // For checkboxes: allow multiple selections
      options.at(optionIndex).get('isCorrect')?.setValue(isChecked);
    }

    console.log(
      `Option ${optionIndex} changed:`,
      isChecked,
      `Type: ${questionType}`
    );
  }

  onQuestionTypeSelect(event: string, index: number) {
    this.questions.at(index).get('type')?.setValue(event);
    console.log(this.form.value);
  }

  projects = [
    { id: 1, name: { en: 'Project 1', ar: 'المشروع 1' } },
    { id: 2, name: { en: 'Project 2', ar: 'المشروع 2' } },
    { id: 3, name: { en: 'Project 3', ar: 'المشروع 3' } },
  ];
  forms = [
    { id: 1, name: { en: 'Form 1', ar: 'النموذج 1' } },
    { id: 2, name: { en: 'Form 2', ar: 'النموذج 2' } },
    { id: 3, name: { en: 'Form 3', ar: 'النموذج 3' } },
  ];
  languages = [
    { id: 'en', name: { en: 'English', ar: 'الإنجليزية' } },
    { id: 'ar', name: { en: 'Arabic', ar: 'العربية' } },
  ];

  form: FormGroup;

  questionTypes = [
    { id: 'SHORT_ANSWER', name: { en: 'Short Answer', ar: 'الإجابة القصيرة' } },
    { id: 'OPEN_ENDED', name: { en: 'Long Answer', ar: 'الإجابة الطويلة' } },
    { id: 'NUMBER', name: { en: 'Number', ar: 'الرقم' } },
    // { id: 'RATE', name: { en: 'Rating', ar: 'التقييم' } },
    { id: 'RADIO', name: { en: 'Radio', ar: 'الاختيار الفردي' } },
    {
      id: 'MULTIPLE_CHOICE',
      name: { en: 'Multiple Choice', ar: 'الاختيار المتعدد' },
    },
  ];

  conditionOptions = [
    { id: '=', name: { en: 'equals', ar: 'يساوي' } },
    { id: '>', name: { en: 'greater_than', ar: 'أكبر من' } },
    { id: '<', name: { en: 'less_than', ar: 'أصغر من' } },
    {
      id: '>=',
      name: { en: 'greater_than_or_equal_to', ar: 'أكبر من أو يساوي' },
    },
    { id: '<=', name: { en: 'less_than_or_equal_to', ar: 'أصغر من أو يساوي' } },
    { id: '!=', name: { en: 'not_equal_to', ar: 'لا يساوي' } },
    { id: 'contains', name: { en: 'contains', ar: 'يحتوي' } },
    { id: 'between', name: { en: 'between', ar: 'بين' } },
  ];

  private idCounter = 1;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      projectId: [''],
      formId: [''],
      language: [''],
      questions: this.fb.array([]),
    });

    // Add a default question for immediate UI
    this.addQuestion();
  }

  // getter for the FormArray
  get questions(): FormArray<FormGroup> {
    return this.form.get('questions') as FormArray<FormGroup>;
  }

  // Factory helpers
  private createCriteriaGroup(effect: 'pass' | 'fail' = 'pass') {
    return this.fb.group({
      condition: ['equals', Validators.required],
      value: [''],
      valueTo: [''],
      effect: [effect, Validators.required],
    });
  }

  private createQuestionGroup(): FormGroup {
    return this.fb.group({
      id: [this.generateId()],
      text: ['', Validators.required],
      description: [''],
      type: ['SHORT_ANSWER', Validators.required],
      order: [this.questions.length + 1],
      criteria: this.fb.array([]),
      options: this.fb.array([]),
    });
  }

  private generateId() {
    return `q-${this.idCounter++}`;
  }

  addQuestion() {
    this.questions.push(this.createQuestionGroup());
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  // These helpers operate on nested arrays. They are used by the template but also
  // passed to the child component so the child can call them with the question index.
  addCriteria(questionIndex: number, effect: 'pass' | 'fail' = 'pass') {
    const criteriaArray = this.getCriteriaArray(questionIndex);
    criteriaArray.push(this.createCriteriaGroup(effect));
  }

  removeCriteria(questionIndex: number, idx: number) {
    const criteriaArray = this.getCriteriaArray(questionIndex);
    criteriaArray.removeAt(idx);
  }

  addOption(questionIndex: number, optionText = '') {
    const options = this.getOptionsArray(questionIndex);
    options.push(
      this.fb.group({ optionText: [optionText], isCorrect: [false] })
    );
    console.log(this.form.value);
  }

  removeOption(questionIndex: number, idx: number) {
    const options = this.getOptionsArray(questionIndex);
    options.removeAt(idx);
  }

  getCriteriaArray(questionIndex: number): FormArray<FormGroup> {
    return this.questions
      .at(questionIndex)
      .get('criteria') as FormArray<FormGroup>;
  }

  getOptionsArray(questionIndex: number): FormArray<FormGroup> {
    return this.questions
      .at(questionIndex)
      .get('options') as FormArray<FormGroup>;
  }

  // Return the concrete controls array for templates to iterate with proper typing
  getOptionsControls(questionIndex: number): FormGroup[] {
    return this.getOptionsArray(questionIndex).controls as FormGroup[];
  }

  // Get filtered criteria by effect
  getPassCriteria(questionIndex: number): FormGroup[] {
    const criteriaArray = this.getCriteriaArray(questionIndex);
    return criteriaArray.controls.filter(
      (c) => c.get('effect')?.value === 'pass'
    ) as FormGroup[];
  }

  getFailCriteria(questionIndex: number): FormGroup[] {
    const criteriaArray = this.getCriteriaArray(questionIndex);
    return criteriaArray.controls.filter(
      (c) => c.get('effect')?.value === 'fail'
    ) as FormGroup[];
  }

  onProjectSelect(value: string) {
    this.form.get('projectId')?.setValue(value);
    console.log('form', this.form.value);
  }

  onFormSelect(value: string) {
    this.form.get('formId')?.setValue(value);
    console.log('form', this.form.value);
  }

  onLanguageSelect(value: string) {
    this.form.get('language')?.setValue(value);
    console.log('form', this.form.value);
  }

  // Save will validate and then send the payload to your API (placeholder here)
  saveAll() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // TODO: call API
    console.log('Saving', this.form.value);
  }

  // Filter condition options based on question type
  getFilteredConditionOptions(questionType: string) {
    const textConditions = ['=', '!=', 'contains'];
    // const numberConditions = ['>', '<', '>=', '<=', 'between'];

    switch (questionType) {
      case 'SHORT_ANSWER':
      case 'OPEN_ENDED':
        return this.conditionOptions.filter((option) =>
          textConditions.includes(option.id)
        );

      case 'NUMBER':
      case 'RATE':
        return this.conditionOptions.filter(
          (option) => !textConditions.includes(option.id)
        );

      case 'MULTIPLE_CHOICE':
      case 'RADIO':
        return []; // Hide criteria for choice-based questions

      default:
        return this.conditionOptions;
    }
  }

  // Check if question type should show input fields
  shouldShowCriteriaInputs(questionType: string): boolean {
    return !['NUMBER', 'RATE', 'MULTIPLE_CHOICE', 'RADIO'].includes(
      questionType
    );
  }

  // Check if question type should show criteria section
  shouldShowCriteriaSection(questionType: string): boolean {
    return !['MULTIPLE_CHOICE', 'RADIO'].includes(questionType);
  }

  // trackBy for better list performance and stable DOM references
  trackById(index: number, item: AbstractControl) {
    const group = item as FormGroup;
    return group.get('id')?.value || index;
  }
}
