import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { ApiQuestionListComponent } from './api-question-list.component';
import { QuestionEditModalComponent } from './question-edit-modal.component';
import { QuestionCreateModalComponent } from './question-create-modal.component';
import { ComboSelectorComponent } from '../../../../components/shared/combo-selector/combo-selector.component';
import { questionTypes } from '../../../../shared/types/questionTypes';
import { conditionOptions } from '../../../../shared/types/conditionOptions';

@Component({
  selector: 'app-form-questions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ComboSelectorComponent,
    ApiQuestionListComponent,
    QuestionEditModalComponent,
    QuestionCreateModalComponent,
  ],
  templateUrl: './form-questions.component.html',
  styleUrls: ['./form-questions.component.scss'],
})
export class FormQuestionsComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  // Question type selection
  selectedQuestionType: 'form' | 'interview' = 'form';

  onCreateModalClose() {
    this.createModalVisible = false;
  }
  onCreateModalSave(newItems: any[]) {
    if (!Array.isArray(newItems)) return;
    newItems.forEach((item) => {
      const group = this.createQuestionGroup();
      group.patchValue({
        text: item.text,
        description: item.description || '',
        type: item.type,
      });
      group.get('source')?.setValue('local');
      const optionsArray = group.get('options') as FormArray<FormGroup>;
      (item.options || []).forEach((opt: any) =>
        optionsArray.push(
          this.fb.group({
            optionText: [opt.optionText || ''],
            isCorrect: [!!opt.isCorrect],
          })
        )
      );
      // Restore criteria from modal items
      const criteriaArray = group.get('criteria') as FormArray<FormGroup>;
      (item.criteria || []).forEach((crit: any) => {
        const critGroup = this.createCriteriaGroup(crit.effect || 'pass');
        critGroup.patchValue({
          condition: crit.condition ?? '=',
          value: crit.value ?? '',
          valueTo: crit.valueTo ?? '',
        });
        criteriaArray.push(critGroup);
      });
      this.questions.push(group);
    });
    this.createModalVisible = false;
  }
  private destroy$ = new Subject<void>();

  // State management
  isLoading = false;
  hasError = false;
  errorMessage = '';
  dataLoaded = false;
  isApiData = false;

  // Edit modal state
  editModalVisible = false;
  editingQuestionIndex: number | null = null;
  createModalVisible = false;

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

  onOptionChangeByGroup(group: FormGroup, optionIndex: number, event: Event) {
    const idx = this.getQuestionIndex(group);
    if (idx >= 0) this.onOptionChange(idx, optionIndex, event);
  }

  onQuestionTypeSelect(event: string, groupOrIndex: number | FormGroup) {
    const group =
      typeof groupOrIndex === 'number'
        ? (this.questions.at(groupOrIndex) as FormGroup)
        : groupOrIndex;
    group.get('type')?.setValue(event);
    console.log(this.form.value);
  }

  // Question type change handler
  onQuestionTypeChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.selectedQuestionType = target.value as 'form' | 'interview';

    // Clear form values when switching types
    this.clearFormValues();

    // Update URL query parameters
    this.updateUrlQueryParams();

    // Load data when ready
    setTimeout(() => this.loadDataWhenReady(), 0);
  }

  // Clear form values when switching question types
  private clearFormValues(): void {
    if (this.selectedQuestionType === 'form') {
      this.form.get('interviewId')?.setValue('');
    } else {
      this.form.get('formId')?.setValue('');
      this.form.get('language')?.setValue('');
    }

    // Clear questions
    while (this.questions.length > 0) {
      this.questions.removeAt(0);
    }

    this.dataLoaded = false;
    this.isApiData = false;
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
  interviews = [
    { id: 1, name: { en: 'Interview 1', ar: 'المقابلة 1' } },
    { id: 2, name: { en: 'Interview 2', ar: 'المقابلة 2' } },
    { id: 3, name: { en: 'Interview 3', ar: 'المقابلة 3' } },
  ];
  languages = [
    { id: 'en', name: { en: 'English', ar: 'الإنجليزية' } },
    { id: 'ar', name: { en: 'Arabic', ar: 'العربية' } },
  ];

  form: FormGroup;

  questionTypes = questionTypes;

  conditionOptions = conditionOptions;

  private idCounter = 1;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      projectId: [''],
      formId: [''],
      interviewId: [''],
      language: [''],
      questions: this.fb.array([]),
    });

    // Don't add default question - wait for all dropdowns to be selected
  }

  // Helper method to check if all required dropdowns are selected
  areAllDropdownsSelected(): boolean {
    const projectId = this.form.get('projectId')?.value;

    if (this.selectedQuestionType === 'form') {
      const formId = this.form.get('formId')?.value;
      const language = this.form.get('language')?.value;
      return !!(projectId && formId && language);
    } else {
      const interviewId = this.form.get('interviewId')?.value;
      return !!(projectId && interviewId);
    }
  }

  // Mock API call - simulate fetching questions from API
  private fetchQuestionsFromAPI(
    projectId: string,
    formId?: string,
    interviewId?: string,
    language?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      // Simulate API delay
      setTimeout(() => {
        // Mock API response - sometimes return data, sometimes empty
        const mockResponses = [
          // Sometimes return data
          {
            questions: [
              {
                id: 'q-1',
                text:
                  this.selectedQuestionType === 'form'
                    ? 'Sample form question from API'
                    : 'Sample interview question from API',
                description: '',
                type: 'SHORT_ANSWER',
                order: 1,
                criteria: [],
                options: [],
              },
            ],
          },
          // Sometimes return empty
          { questions: [] },
          // Sometimes throw error
          null, // This will trigger the error simulation below
        ];

        const randomResponse = mockResponses[0];

        if (randomResponse === null) {
          reject(new Error('API Error: Failed to fetch questions'));
        } else {
          resolve(randomResponse);
        }
      }, 1500); // 1.5 second delay to simulate network
    });
  }

  // Load data when all dropdowns are selected
  async loadDataWhenReady(): Promise<void> {
    if (!this.areAllDropdownsSelected()) {
      // Clear any existing questions if dropdowns are not all selected
      while (this.questions.length > 0) {
        this.questions.removeAt(0);
      }
      this.dataLoaded = false;
      return;
    }

    if (this.dataLoaded) {
      return; // Already loaded
    }

    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    try {
      const projectId = this.form.get('projectId')?.value;
      let formId, interviewId, language;

      if (this.selectedQuestionType === 'form') {
        formId = this.form.get('formId')?.value;
        language = this.form.get('language')?.value;
      } else {
        interviewId = this.form.get('interviewId')?.value;
      }

      // Try to fetch from API first
      const apiData = await this.fetchQuestionsFromAPI(
        projectId,
        formId,
        interviewId,
        language
      );

      if (apiData && apiData.questions && apiData.questions.length > 0) {
        // Use API data
        this.restoreFormData(apiData, 'api');
        this.isApiData = true;
      } else {
        // Fallback to localStorage
        const localData = this.loadQuestionsFromLocalStorage(
          this.selectedQuestionType === 'form' ? formId : interviewId,
          projectId,
          this.selectedQuestionType
        );
        if (localData) {
          this.restoreFormData(localData, 'local');
          this.isApiData = false;
        } else {
          // No data from either source, add a default question
          this.addQuestion();
          this.isApiData = false;
        }
      }

      this.dataLoaded = true;
    } catch (error) {
      this.hasError = true;
      this.errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      // Fallback to localStorage on error
      const projectId = this.form.get('projectId')?.value;
      const formId = this.form.get('formId')?.value;
      const interviewId = this.form.get('interviewId')?.value;

      if (projectId && (formId || interviewId)) {
        const localData = this.loadQuestionsFromLocalStorage(
          this.selectedQuestionType === 'form' ? formId : interviewId,
          projectId,
          this.selectedQuestionType
        );
        if (localData) {
          this.restoreFormData(localData, 'local');
          this.isApiData = false;
        } else {
          // No local data either, add default question
          this.addQuestion();
          this.isApiData = false;
        }
      }

      this.dataLoaded = true;
    } finally {
      this.isLoading = false;
    }
  }

  ngOnInit() {
    // First, set initial values from URL query parameters synchronously
    this.setInitialValuesFromUrl();

    // Handle query parameters from navigation (for subsequent changes)
    this.route.queryParams.subscribe((params) => {
      if (params['projectId']) {
        this.form.get('projectId')?.setValue(params['projectId']);
      }
      if (params['formId']) {
        this.form.get('formId')?.setValue(params['formId']);
      }
      if (params['language']) {
        this.form.get('language')?.setValue(params['language']);
      }
      if (params['locationId']) {
        // Handle locationId if needed for form creation
        console.log('Location ID from navigation:', params['locationId']);
      }
      if (params['formName']) {
        // Handle form name if needed
        console.log('Form name from navigation:', params['formName']);
      }

      // Load data when all parameters are set
      setTimeout(() => {
        this.loadDataWhenReady();
      }, 100);
    });

    // Setup auto-save for drafts
    this.setupAutoSave();
  }

  ngAfterViewInit() {
    // Additional change detection after view is fully initialized
    // This ensures combo-selectors are properly updated with form values

    // Force another change detection cycle to ensure combo-selectors reflect the values
    this.cdr.detectChanges();

    // Log the current values that should be selected

    // Additional safety check after a short delay and try to load data
    setTimeout(() => {
      this.cdr.detectChanges();
      this.loadDataWhenReady();
    }, 100);
  }

  // Set initial values from URL synchronously on first load
  private setInitialValuesFromUrl(): void {
    const params = this.route.snapshot.queryParams;
    let hasChanges = false;

    // Set question type from URL
    if (params['questionType']) {
      this.selectedQuestionType = params['questionType'] as
        | 'form'
        | 'interview';
      hasChanges = true;
    }

    if (params['projectId']) {
      this.form.get('projectId')?.setValue(params['projectId']);
      hasChanges = true;
    }

    if (this.selectedQuestionType === 'form') {
      if (params['formId']) {
        this.form.get('formId')?.setValue(params['formId']);
        hasChanges = true;
      }
      if (params['language']) {
        this.form.get('language')?.setValue(params['language']);
        hasChanges = true;
      }
    } else {
      if (params['interviewId']) {
        this.form.get('interviewId')?.setValue(params['interviewId']);
        hasChanges = true;
      }
    }

    if (params['locationId']) {
    }

    if (params['formName']) {
    }

    // Force change detection to ensure combo-selectors get updated values
    if (hasChanges) {
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupAutoSave(): void {
    // Auto-save draft every 5 seconds when form changes
    this.form.valueChanges
      .pipe(
        debounceTime(5000), // Wait 5 seconds after last change
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        // Only auto-save if we have required fields and projectId
        const projectId = this.form.get('projectId')?.value;
        const formId = this.form.get('formId')?.value;
        const interviewId = this.form.get('interviewId')?.value;

        if (projectId && this.questions.length > 0) {
          if (this.selectedQuestionType === 'form' && formId) {
            this.saveDraftToLocalStorage();
          } else if (this.selectedQuestionType === 'interview' && interviewId) {
            this.saveDraftToLocalStorage();
          }
        }
      });
  }

  private restoreFormData(data: any, source: 'api' | 'local' = 'local'): void {
    // Clear existing questions
    while (this.questions.length > 0) {
      this.questions.removeAt(0);
    }

    // Restore form data
    if (data.projectId) this.form.get('projectId')?.setValue(data.projectId);
    if (data.questionType) this.selectedQuestionType = data.questionType;
    if (data.formId) this.form.get('formId')?.setValue(data.formId);
    if (data.interviewId)
      this.form.get('interviewId')?.setValue(data.interviewId);
    if (data.language) this.form.get('language')?.setValue(data.language);

    // Restore questions
    if (data.questions && data.questions.length > 0) {
      data.questions.forEach((question: any) => {
        const questionGroup = this.createQuestionGroup();
        questionGroup.patchValue({
          id: question.id,
          text: question.text,
          description: question.description,
          type: question.type,
          order: question.order,
        });
        (questionGroup.get('source') as any)?.setValue(source);

        // Restore criteria
        if (question.criteria && question.criteria.length > 0) {
          question.criteria.forEach((criteria: any) => {
            const criteriaGroup = this.createCriteriaGroup(criteria.effect);
            criteriaGroup.patchValue(criteria);
            (questionGroup.get('criteria') as FormArray).push(criteriaGroup);
          });
        }

        // Restore options
        if (question.options && question.options.length > 0) {
          question.options.forEach((option: any) => {
            const optionGroup = this.fb.group({
              optionText: [option.optionText],
              isCorrect: [option.isCorrect],
            });
            (questionGroup.get('options') as FormArray).push(optionGroup);
          });
        }

        this.questions.push(questionGroup);
      });
    }
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
      source: ['local'],
      criteria: this.fb.array([]),
      options: this.fb.array([]),
    });
  }

  private generateId() {
    return `q-${this.idCounter++}`;
  }

  addQuestion() {
    this.createModalVisible = true;
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  removeQuestionByGroup(group: FormGroup) {
    const idx = (this.questions.controls as FormGroup[]).indexOf(group);
    if (idx >= 0) this.removeQuestion(idx);
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
  }

  addOptionByGroup(group: FormGroup, optionText = '') {
    const idx = (this.questions.controls as FormGroup[]).indexOf(group);
    if (idx >= 0) this.addOption(idx, optionText);
  }

  removeOption(questionIndex: number, idx: number) {
    const options = this.getOptionsArray(questionIndex);
    options.removeAt(idx);
  }

  removeOptionByGroup(group: FormGroup, idx: number) {
    const qIdx = (this.questions.controls as FormGroup[]).indexOf(group);
    if (qIdx >= 0) this.removeOption(qIdx, idx);
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

  getOptionsControlsByGroup(group: FormGroup): FormGroup[] {
    const idx = (this.questions.controls as FormGroup[]).indexOf(group);
    return idx >= 0 ? (this.getOptionsArray(idx).controls as FormGroup[]) : [];
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

  onProjectSelect(value: string | null) {
    if (value === null) {
      this.form.get('projectId')?.setValue('');
    } else {
      this.form.get('projectId')?.setValue(value);
    }
    console.log('Project selected:', value);

    // Update URL with query parameters
    this.updateUrlQueryParams();

    // Load data when all dropdowns are selected
    setTimeout(() => this.loadDataWhenReady(), 0);
  }

  onFormSelect(value: string | null) {
    if (value === null) {
      this.form.get('formId')?.setValue('');
    } else {
      this.form.get('formId')?.setValue(value);
    }

    // Update URL with query parameters
    this.updateUrlQueryParams();

    // Load data when all dropdowns are selected
    setTimeout(() => this.loadDataWhenReady(), 0);
  }

  onLanguageSelect(value: string) {
    this.form.get('language')?.setValue(value);
    console.log('form', this.form.value);

    // Update URL with query parameters
    this.updateUrlQueryParams();

    // Load data when all dropdowns are selected
    setTimeout(() => this.loadDataWhenReady(), 0);
  }

  onInterviewSelect(value: string | null) {
    if (value === null) {
      this.form.get('interviewId')?.setValue('');
    } else {
      this.form.get('interviewId')?.setValue(value);
    }

    // Update URL with query parameters
    this.updateUrlQueryParams();

    // Load data when all dropdowns are selected
    setTimeout(() => this.loadDataWhenReady(), 0);
  }

  // Update URL query parameters when selections change
  private updateUrlQueryParams(): void {
    const projectId = this.form.get('projectId')?.value;
    const formId = this.form.get('formId')?.value;
    const interviewId = this.form.get('interviewId')?.value;
    const language = this.form.get('language')?.value;

    // Get current query parameters
    const currentParams = { ...this.route.snapshot.queryParams };

    // Update with new values, remove empty values
    const newParams: any = { ...currentParams };

    // Add question type
    newParams.questionType = this.selectedQuestionType;

    if (projectId) {
      newParams.projectId = projectId;
    } else {
      delete newParams.projectId;
    }

    if (this.selectedQuestionType === 'form') {
      if (formId) {
        newParams.formId = formId;
      } else {
        delete newParams.formId;
      }
      if (language) {
        newParams.language = language;
      } else {
        delete newParams.language;
      }
      // Remove interview-specific params
      delete newParams.interviewId;
    } else {
      if (interviewId) {
        newParams.interviewId = interviewId;
      } else {
        delete newParams.interviewId;
      }
      // Remove form-specific params
      delete newParams.formId;
      delete newParams.language;
    }

    // Navigate with new query parameters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: newParams,
      replaceUrl: true, // Use replaceUrl to avoid adding to browser history
    });
  }

  // LocalStorage keys
  private getDraftKey(
    id: string,
    projectId: string,
    type: 'form' | 'interview'
  ): string {
    const prefix = type === 'form' ? 'form-draft' : 'interview-draft';
    return `${prefix}-${projectId}-${id}`;
  }

  private getFormKey(
    id: string,
    projectId: string,
    type: 'form' | 'interview'
  ): string {
    const prefix = type === 'form' ? 'form-questions' : 'interview-questions';
    return `${prefix}-${projectId}-${id}`;
  }

  // Save draft to localStorage
  private saveDraftToLocalStorage(): void {
    const projectId = this.form.get('projectId')?.value;
    const formId = this.form.get('formId')?.value;
    const interviewId = this.form.get('interviewId')?.value;

    if (projectId) {
      const id = this.selectedQuestionType === 'form' ? formId : interviewId;
      if (id) {
        const draftData = {
          ...this.form.value,
          questionType: this.selectedQuestionType,
          timestamp: new Date().toISOString(),
          isDraft: true,
        };
        localStorage.setItem(
          this.getDraftKey(id, projectId, this.selectedQuestionType),
          JSON.stringify(draftData)
        );
        console.log('Draft saved to localStorage:', draftData);
      }
    }
  }

  // Load draft from localStorage
  private loadDraftFromLocalStorage(
    id: string,
    projectId: string,
    type: 'form' | 'interview'
  ): any {
    const draftKey = this.getDraftKey(id, projectId, type);
    const draftData = localStorage.getItem(draftKey);
    if (draftData) {
      try {
        return JSON.parse(draftData);
      } catch (e) {
        console.error('Error parsing draft data:', e);
        return null;
      }
    }
    return null;
  }

  // Save final questions to localStorage
  private saveQuestionsToLocalStorage(): void {
    const projectId = this.form.get('projectId')?.value;
    const formId = this.form.get('formId')?.value;
    const interviewId = this.form.get('interviewId')?.value;

    if (projectId) {
      const id = this.selectedQuestionType === 'form' ? formId : interviewId;
      if (id) {
        const questionsData = {
          ...this.form.value,
          questionType: this.selectedQuestionType,
          timestamp: new Date().toISOString(),
          isDraft: false,
        };
        localStorage.setItem(
          this.getFormKey(id, projectId, this.selectedQuestionType),
          JSON.stringify(questionsData)
        );

        // Clear draft after saving final version
        this.clearDraftFromLocalStorage(
          id,
          projectId,
          this.selectedQuestionType
        );
        console.log('Questions saved to localStorage:', questionsData);
      }
    }
  }

  // Load final questions from localStorage
  private loadQuestionsFromLocalStorage(
    id: string,
    projectId: string,
    type: 'form' | 'interview' = 'form'
  ): any {
    const formKey = this.getFormKey(id, projectId, type);
    const questionsData = localStorage.getItem(formKey);
    if (questionsData) {
      try {
        return JSON.parse(questionsData);
      } catch (e) {
        console.error('Error parsing questions data:', e);
        return null;
      }
    }
    return null;
  }

  // Clear draft from localStorage
  private clearDraftFromLocalStorage(
    id: string,
    projectId: string,
    type: 'form' | 'interview'
  ): void {
    const draftKey = this.getDraftKey(id, projectId, type);
    localStorage.removeItem(draftKey);
    console.log('Draft cleared from localStorage');
  }

  // Mock API methods for CRUD operations
  private async createQuestionsAPI(payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate API success
        const response = {
          success: true,
          message: 'Questions created successfully',
          data: {
            id: `created-${Date.now()}`,
            ...payload,
          },
        };
        resolve(response);
      }, 1000);
    });
  }

  private async updateQuestionsAPI(payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate API success
        const response = {
          success: true,
          message: 'Questions updated successfully',
          data: {
            id: payload.id || `updated-${Date.now()}`,
            ...payload,
          },
        };
        resolve(response);
      }, 1000);
    });
  }

  private async deleteQuestionsAPI(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate API success
        const response = {
          success: true,
          message: 'Questions deleted successfully',
          data: { id },
        };
        resolve(response);
      }, 1000);
    });
  }

  // Save will validate and then send the payload to your API
  async saveAll() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    try {
      const payload = {
        ...this.form.value,
        questionType: this.selectedQuestionType,
        timestamp: new Date().toISOString(),
      };

      // Remove empty arrays and null values
      if (payload.questions.length === 0) {
        delete payload.questions;
      }

      // Call appropriate API based on question type
      let response;
      if (this.selectedQuestionType === 'form') {
        // For form questions, send formId and language
        const formPayload = {
          projectId: payload.projectId,
          formId: payload.formId,
          language: payload.language,
          questions: payload.questions || [],
        };
        response = await this.createQuestionsAPI(formPayload);
      } else {
        // For interview questions, send interviewId (no language)
        const interviewPayload = {
          projectId: payload.projectId,
          interviewId: payload.interviewId,
          questions: payload.questions || [],
        };
        response = await this.createQuestionsAPI(interviewPayload);
      }

      console.log('API Response:', response);

      // Save to localStorage as backup
      this.saveQuestionsToLocalStorage();

      // Show success message (you can implement a toast/notification here)
      alert('Questions saved successfully!');
    } catch (error) {
      console.error('Error saving questions:', error);
      alert('Error saving questions. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }

  // Save draft manually
  saveDraft(): void {
    this.saveDraftToLocalStorage();
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

  // trackBy for combo-selector options to prevent unnecessary re-renders
  trackByProjectId(index: number, item: any) {
    return item.id;
  }

  // API list actions
  onEditQuestion(index: number) {
    this.editingQuestionIndex = index;
    this.editModalVisible = true;
  }

  async onDeleteQuestion(index: number) {
    const question = this.questions.at(index);
    const questionId = question.get('id')?.value;

    if (questionId && questionId.startsWith('q-')) {
      // Local question, just remove from form
      this.removeQuestion(index);
    } else {
      // API question, call delete API
      try {
        this.isLoading = true;
        const response = await this.deleteQuestionsAPI(questionId);
        console.log('Delete API Response:', response);

        // Remove from form after successful API call
        this.removeQuestion(index);

        // Show success message
        alert('Question deleted successfully!');
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Error deleting question. Please try again.');
      } finally {
        this.isLoading = false;
      }
    }
  }

  onModalClose() {
    this.editModalVisible = false;
    this.editingQuestionIndex = null;
  }

  async onModalSave(updated: any) {
    if (this.editingQuestionIndex === null) return;
    const qGroup = this.questions.at(this.editingQuestionIndex) as FormGroup;
    const questionId = qGroup.get('id')?.value;

    // Update the form group
    qGroup.patchValue({
      text: updated.text,
      description: updated.description ?? qGroup.get('description')?.value,
      type: updated.type,
    });

    // Update options if provided
    if (Array.isArray(updated.options)) {
      const optionsArray = qGroup.get('options') as FormArray<FormGroup>;
      while (optionsArray.length > 0) {
        optionsArray.removeAt(0);
      }
      updated.options.forEach((opt: any) => {
        optionsArray.push(
          this.fb.group({
            optionText: [opt.optionText],
            isCorrect: [!!opt.isCorrect],
          })
        );
      });
    }

    // Update criteria if provided
    if (Array.isArray(updated.criteria)) {
      const criteriaArray = qGroup.get('criteria') as FormArray<FormGroup>;
      while (criteriaArray.length > 0) {
        criteriaArray.removeAt(0);
      }
      updated.criteria.forEach((crit: any) => {
        const critGroup = this.createCriteriaGroup(crit.effect || 'pass');
        critGroup.patchValue({
          condition: crit.condition ?? '=',
          value: crit.value ?? '',
          valueTo: crit.valueTo ?? '',
        });
        criteriaArray.push(critGroup);
      });
    }

    // If it's an API question, call update API
    if (questionId && !questionId.startsWith('q-')) {
      try {
        this.isLoading = true;
        const payload = {
          id: questionId,
          ...updated,
          projectId: this.form.get('projectId')?.value,
          questionType: this.selectedQuestionType,
        };

        if (this.selectedQuestionType === 'form') {
          payload.formId = this.form.get('formId')?.value;
          payload.language = this.form.get('language')?.value;
        } else {
          payload.interviewId = this.form.get('interviewId')?.value;
        }

        const response = await this.updateQuestionsAPI(payload);
        console.log('Update API Response:', response);

        // Show success message
        alert('Question updated successfully!');
      } catch (error) {
        console.error('Error updating question:', error);
        alert('Error updating question. Please try again.');
      } finally {
        this.isLoading = false;
      }
    }

    this.onModalClose();
  }

  // Helper: local questions
  getLocalQuestionsControls(): FormGroup[] {
    return (this.questions.controls as FormGroup[]).filter(
      (q) => q.get('source')?.value !== 'api'
    );
  }

  hasLocalQuestions(): boolean {
    return this.getLocalQuestionsControls().length > 0;
  }

  getQuestionIndex(group: FormGroup): number {
    return (this.questions.controls as FormGroup[]).indexOf(group);
  }
}
