import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import api from '../../core/api/api';
import {
  DynamicFormDto,
  FormAnswersMap,
  FormQuestionDto,
} from '../../shared/types/form';
import { LoadingSpinnerComponent } from '../../components/shared/loading-spinner/loading-spinner.component';
import { OpenEndedQuestionComponent } from '../../components/form/questions/open-ended-question.component';
import { ShortAnswerQuestionComponent } from '../../components/form/questions/short-answer-question.component';
import { NumberQuestionComponent } from '../../components/form/questions/number-question.component';
import { RateQuestionComponent } from '../../components/form/questions/rate-question.component';
import { DropdownQuestionComponent } from '../../components/form/questions/dropdown-question.component';
import { RadioQuestionComponent } from '../../components/form/questions/radio-question.component';
import { MultipleChoiceQuestionComponent } from '../../components/form/questions/multiple-choice-question.component';

@Component({
  selector: 'app-interview-questions-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent,
    OpenEndedQuestionComponent,
    ShortAnswerQuestionComponent,
    NumberQuestionComponent,
    RateQuestionComponent,
    DropdownQuestionComponent,
    RadioQuestionComponent,
    MultipleChoiceQuestionComponent,
  ],
  template: `
    <section class="form-page">
      <div class="title" *ngIf="loading(); else content">{{ title() }}</div>

      <ng-template #content>
        <div class="header">
          <button class="back" (click)="onBack()">←</button>
          <h2 class="title">{{ title() }}</h2>
          <div class="meta">{{ meta() }}</div>
        </div>

        <form class="form-grid" [formGroup]="formGroup" (ngSubmit)="submit()">
          <ng-container *ngFor="let q of questions()">
            <ng-container [ngSwitch]="q.typeCode">
              <app-open-ended-question
                *ngSwitchCase="'OPEN_ENDED'"
                [question]="q"
                [control]="control(q.questionId)"
                [showErrors]="showErrors()"
              ></app-open-ended-question>

              <app-short-answer-question
                *ngSwitchCase="'SHORT_ANSWER'"
                [question]="q"
                [control]="control(q.questionId)"
                [showErrors]="showErrors()"
              ></app-short-answer-question>

              <app-number-question
                *ngSwitchCase="'NUMBER'"
                [question]="q"
                [control]="control(q.questionId)"
                [showErrors]="showErrors()"
              ></app-number-question>

              <app-rate-question
                *ngSwitchCase="'RATE'"
                [question]="q"
                [control]="control(q.questionId)"
                [showErrors]="showErrors()"
              ></app-rate-question>

              <app-dropdown-question
                *ngSwitchCase="'DROPDOWN'"
                [question]="q"
                [control]="control(q.questionId)"
                [showErrors]="showErrors()"
              ></app-dropdown-question>

              <app-radio-question
                *ngSwitchCase="'RADIO'"
                [question]="q"
                [control]="control(q.questionId)"
                [showErrors]="showErrors()"
              ></app-radio-question>

              <app-multiple-choice-question
                *ngSwitchCase="'MULTIPLE_CHOICE'"
                [question]="q"
                [control]="control(q.questionId)"
                [showErrors]="showErrors()"
              ></app-multiple-choice-question>
            </ng-container>
          </ng-container>
          <!-- TODO: radio inputs for accept or reject that will be submitted to the backend -->
          <div class="accept-reject">
            <label for="accept">Accept</label>
            <input
              type="radio"
              [formControl]="control('outcome')"
              id="outcome"
              name="outcome"
              value="ACCEPTED"
            />
            <label for="reject">Reject</label>
            <input
              type="radio"
              [formControl]="control('outcome')"
              id="outcome"
              name="outcome"
              value="REJECTED"
            />
          </div>
          <div class="decision-notes">
            <label for="decisionNotes">Decision Notes</label>
            <textarea
              id="decisionNotes"
              name="decisionNotes"
              [formControl]="control('decisionNotes')"
            ></textarea>
          </div>
          <div class="actions">
            <button type="submit" class="btn primary">Submit</button>
          </div>
        </form>
      </ng-template>

      <div class="overlay" *ngIf="loading()">
        <app-loading-spinner label="Loading form..." />
      </div>
    </section>
  `,
  styles: [
    `
      .form-page {
        position: relative;
        padding: var(--padding-section);
        min-height: 70vh;
      }
      .header {
        display: flex;
        align-items: center;
        gap: 1rem;
        justify-content: space-between;
        margin-bottom: 1.25rem;
      }
      .back {
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 1.1rem;
      }
      .title {
        text-align: center;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--color-dark-text);
        margin: 0;
      }
      .meta {
        font-size: 0.9rem;
        color: var(--color-font-secondary);
      }
      .overlay {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        background: rgba(var(--shadow-dark), 0.05);
      }
      .form-grid {
        display: grid;
        gap: 1.25rem;
        max-width: 900px;
        margin: 0 auto;
      }
      .actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 1.5rem;
      }
      .btn {
        padding: 0.75rem 1.5rem;
        border-radius: var(--radius-btn);
        border: 1px solid transparent;
        cursor: pointer;
        font-weight: 600;
      }
      .btn.primary {
        background: var(--accent);
        color: var(--white);
      }
      .btn.primary:hover {
        background: var(--btn-hover-color);
      }
      .btn.secondary {
        background: rgba(var(--secondary-rgb), 0.1);
        color: var(--secondary);
        border-color: rgba(var(--secondary-rgb), 0.25);
      }

      /* === New styles for outcome & decision notes === */
      .accept-reject {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 1rem;
        border: 1px solid rgba(var(--shadow-dark), 0.15);
        border-radius: var(--radius-btn);
        background: rgba(var(--secondary-rgb), 0.05);
      }
      .accept-reject label {
        font-weight: 600;
        font-size: 0.95rem;
        color: var(--color-dark-text);
      }
      .accept-reject input[type='radio'] {
        margin-right: 0.5rem;
        cursor: pointer;
      }

      .decision-notes {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .decision-notes label {
        font-weight: 600;
        font-size: 0.95rem;
        color: var(--color-dark-text);
      }
      .decision-notes textarea {
        resize: vertical;
        min-height: 100px;
        padding: 0.75rem;
        border-radius: var(--radius-btn);
        border: 1px solid rgba(var(--shadow-dark), 0.2);
        font-size: 0.95rem;
        line-height: 1.4;
        color: var(--color-dark-text);
      }
      .decision-notes textarea:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.25);
      }
    `,
  ],
})
export class InterviewQuestionsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  loading = signal(true);
  title = signal('');
  meta = signal('');
  questions = signal<FormQuestionDto[]>([]);
  formGroup!: FormGroup;
  showErrors = signal(false);
  userId = signal<string>('');

  // storage key uses formId OR interviewId (prefer route param formId if present)
  private get storageKey(): string {
    const formId = this.route.snapshot.paramMap.get('formId');
    const interviewId = this.route.snapshot.paramMap.get('interviewId');
    const keyId = formId ?? interviewId ?? 'form';
    return `interview_form_answers_${keyId}`;
  }

  async ngOnInit(): Promise<void> {
    try {
      // allow either formId or interviewId — if interviewId you may want to fetch mapping
      const formId = this.route.snapshot.paramMap.get('formId');
      const interviewId = this.route.snapshot.paramMap.get('interviewId');
      const userId = this.route.snapshot.queryParams['userId'];

      // Set userId if provided
      if (userId) {
        this.userId.set(userId);
      }

      let questions: any[] = [];
      let formTitle = 'Interview Questions';
      let formLanguage = 'en';

      if (interviewId) {
        // Load interview questions
        const interviewData: any = await api.getInterviewQuestions({
          interviewId,
        });
        const payload = (interviewData as any)?.result ?? interviewData ?? {};
        questions = Array.isArray(payload.questions) ? payload.questions : [];

        // Try to get interview title
        try {
          const interviewInfo: any = await api.getInterview({ interviewId });
          const infoPayload =
            (interviewInfo as any)?.result ?? interviewInfo ?? {};
          formTitle = infoPayload.name ?? 'Interview Questions';
        } catch (error) {
          console.warn('Could not load interview info:', error);
        }
      } else if (formId) {
        // Load form questions
        const formData: any = await api.getAllFormQuestions({ formId });
        const payload = (formData as any)?.result ?? formData ?? {};
        questions = Array.isArray(payload.questions) ? payload.questions : [];

        // Try to get form title
        try {
          const formInfo: any = await api.getForm({ formId });
          const infoPayload = (formInfo as any)?.result ?? formInfo ?? {};
          formTitle =
            infoPayload.formTitle ?? infoPayload.title ?? 'Form Questions';
          formLanguage = infoPayload.formLanguage ?? 'en';
        } catch (error) {
          console.warn('Could not load form info:', error);
        }
      }

      // Map questions to FormQuestionDto format
      const mapType = (t: any): FormQuestionDto['typeCode'] => {
        const up = String(t || '').toUpperCase();
        const allowed = [
          'OPEN_ENDED',
          'SHORT_ANSWER',
          'NUMBER',
          'RATE',
          'DROPDOWN',
          'RADIO',
          'MULTIPLE_CHOICE',
        ];
        return (allowed as string[]).includes(up)
          ? (up as FormQuestionDto['typeCode'])
          : 'OPEN_ENDED';
      };

      const mappedQuestions = questions.map((q: any, idx: number) => ({
        questionId: String(q.questionId ?? q.id ?? `q-${idx + 1}`),
        typeCode: mapType(q.type ?? q.typeCode),
        questionText: q.text ?? q.title ?? q.questionText ?? 'Question',
        options: (
          (q.options ?? q.answerOptions ?? q.choices ?? []) as any[]
        ).map((opt: any, i: number) => ({
          optionId: String(opt.optionId ?? opt.id ?? `o-${i + 1}`),
          optionText: opt.optionText ?? opt.text ?? opt.label ?? '',
        })),
        required: !!q.required,
        min: q.min,
        max: q.max,
      }));

      const dto: DynamicFormDto = {
        formId: formId ?? interviewId ?? 'interview-form',
        formTitle,
        formLanguage,
        questions: mappedQuestions,
      };

      this.title.set(dto.formTitle);
      this.meta.set(
        `${dto.formLanguage?.toUpperCase() ?? 'EN'} • ${
          dto.questions.length
        } questions`
      );
      this.questions.set(dto.questions);
      this.buildForm(dto);
      this.restoreDraft();
    } catch (error) {
      console.error('Error loading interview questions:', error);
      this.title.set('Error loading questions');
      this.meta.set('');
      this.questions.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  buildForm(dto: DynamicFormDto): void {
    const controls: Record<string, FormControl> = {};
    for (const q of dto.questions) {
      const validators = [];
      if (q.required) validators.push(Validators.required);
      if (q.typeCode === 'NUMBER' || q.typeCode === 'RATE') {
        if (q.min !== undefined) validators.push(Validators.min(q.min));
        if (q.max !== undefined) validators.push(Validators.max(q.max));
      }
      const initial = q.typeCode === 'MULTIPLE_CHOICE' ? [] : '';
      controls[q.questionId] = new FormControl(initial, validators);
    }
    // Add outcome and decisionNotes controls
    controls['outcome'] = new FormControl('');
    controls['decisionNotes'] = new FormControl('');
    this.formGroup = this.fb.group(controls);
    // persist draft on changes
    this.formGroup.valueChanges.subscribe(() => this.persistDraft());
  }

  control(id: string): FormControl {
    return this.formGroup.get(id) as FormControl;
  }

  persistDraft(): void {
    const answers = this.formGroup.getRawValue() as FormAnswersMap;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(answers));
    } catch {}
  }

  restoreDraft(): void {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as FormAnswersMap;
      this.formGroup.patchValue(parsed, { emitEvent: false });
    } catch {}
  }

  saveDraft(): void {
    this.persistDraft();
  }

  async submit(): Promise<void> {
    if (this.formGroup.invalid) {
      this.showErrors.set(true);
      this.formGroup.markAllAsTouched();
      return;
    }

    try {
      this.loading.set(true);
      const formId = this.route.snapshot.paramMap.get('formId');
      const interviewId = this.route.snapshot.paramMap.get('interviewId');
      const payload = this.formGroup.getRawValue();

      // Transform answers to API format (exclude outcome and decisionNotes)
      const answers = Object.entries(payload)
        .filter(
          ([questionId]) =>
            questionId !== 'outcome' && questionId !== 'decisionNotes'
        )
        .map(([questionId, answer]) => ({
          questionId,
          answerType: (Array.isArray(answer)
            ? 'options'
            : typeof answer === 'number'
            ? 'numeric'
            : 'text') as 'text' | 'rating' | 'numeric' | 'options',
          textResponse: typeof answer === 'string' ? answer : undefined,
          numericResponse: typeof answer === 'number' ? answer : undefined,
          optionIds: Array.isArray(answer) ? answer : undefined,
        }));

      // Submit form
      if (interviewId) {
        await api.createSubmissionWithAnswers({
          interviewId,
          answers,
          userId: this.userId(),
          outcome: this.control('outcome').value,
          decisionNotes: this.control('decisionNotes').value || '',
        });
      } else if (formId) {
        await api.createSubmissionWithAnswers({
          formId,
          answers,
          userId: this.userId(),
        });
      }

      // Clear draft and navigate back
      localStorage.removeItem(this.storageKey);
      this.router.navigate(['/dashboard/interview']);
    } catch (error) {
      console.error('Error submitting interview answers:', error);
    } finally {
      this.loading.set(false);
    }
  }

  onBack() {
    // go back to previous page (interviewer list / interview detail)
    this.router.navigate(['/dashboard/interview']);
  }
}
