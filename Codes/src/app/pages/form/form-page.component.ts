import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
import { Location } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-form-page',
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
    TranslateModule,
  ],
  template: `
    <section class="form-page">
      <button class="back" (click)="goBack()">
        &larr; {{ 'COMMON.BUTTONS.CANCEL' | translate }}
      </button>
      <div class="title" *ngIf="loading(); else content">{{ title() }}</div>
      <ng-template #content>
        <div class="title">{{ title() }}</div>
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

          <div class="actions">
            <button type="button" class="btn secondary" (click)="saveDraft()">
              Save Draft
            </button>
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
      .back {
        background: transparent;
        border: none;
        color: rgba(var(--bg-dark-rgb), 0.7);
        cursor: pointer;
        margin-bottom: 1rem;
      }
      .form-page {
        position: relative;
        padding: var(--padding-section);
        min-height: 100vh;
      }
      .overlay {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        background: rgba(var(--shadow-dark), 0.05);
      }
      .title {
        text-align: center;
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--color-dark-text);
        margin-bottom: 2rem;
      }
      .form-grid {
        display: grid;
        gap: 1.25rem;
        max-width: 800px;
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
    `,
  ],
})
export class FormPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  loading = signal(true);
  title = signal('');
  questions = signal<FormQuestionDto[]>([]);
  formGroup!: FormGroup;
  showErrors = signal(false);
  private readonly location = inject(Location);

  private get storageKey(): string {
    const formId = this.route.snapshot.paramMap.get('formId') || 'form';
    return `form_answers_${formId}`;
  }
  async getForm(formId: string) {
    const data: any = await api.getForm({ formId });
    const formData = (data as any)?.result ?? data ?? {};
    const formPayload = formData?.form ?? formData;
    this.title.set(
      formPayload?.formTitle ??
        formPayload?.title ??
        formPayload?.name ??
        'Form'
    );
    return formData;
  }
  async getAllFormQuestions(formId: string) {
    const questionsData: any = await api.getAllFormQuestions({ formId });
    const questionsPayload =
      (questionsData as any)?.result ?? questionsData ?? {};
    const list = Array.isArray(questionsPayload)
      ? questionsPayload
      : Array.isArray((questionsPayload as any)?.questions)
      ? (questionsPayload as any).questions
      : Array.isArray((questionsPayload as any)?.items)
      ? (questionsPayload as any).items
      : Array.isArray((questionsPayload as any)?.data)
      ? (questionsPayload as any).data
      : [];
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

    const questions = (list as any[]).map((q: any, idx: number) => ({
      questionId: String(q.questionId ?? q.id ?? `q-${idx + 1}`),
      typeCode: mapType(q.type ?? q.typeCode),
      questionText: q.text ?? q.title ?? q.questionText ?? 'Question',
      options: ((q.options ?? q.answerOptions ?? q.choices ?? []) as any[]).map(
        (opt: any, i: number) => ({
          optionId: String(opt.optionId ?? opt.id ?? `o-${i + 1}`),
          optionText: opt.optionText ?? opt.text ?? opt.label ?? '',
        })
      ),
      required: !!q.required,
      min: q.min,
      max: q.max,
    }));

    this.questions.set(questions);
    return questions;
  }
  async ngOnInit() {
    const formId = this.route.snapshot.paramMap.get('formId')!;

    try {
      // Load form meta directly
      const [formPayload, questions] = await Promise.all([
        this.getForm(formId),
        this.getAllFormQuestions(formId),
      ]);
      // Load questions directly
      const dto: DynamicFormDto = {
        formId,
        formTitle: this.title(),
        formLanguage: formPayload?.formLanguage ?? 'en',
        questions,
      };
      this.buildForm(dto);
      this.restoreDraft();
    } catch (error) {
      this.title.set('Error loading form');
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
    this.formGroup = this.fb.group(controls);

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
      const formId = this.route.snapshot.paramMap.get('formId')!;
      const payload = this.formGroup.getRawValue();

      // Transform answers to API format
      const answers = Object.entries(payload).map(([questionId, answer]) => ({
        questionId,
        answerType: (Array.isArray(answer)
          ? 'options'
          : typeof answer === 'number'
          ? 'numeric'
          : 'text') as 'text' | 'rating' | 'numeric' | 'options',
        textResponse: typeof answer === 'string' ? answer : undefined,
        rating: typeof answer === 'number' ? answer : undefined,
        optionIds: Array.isArray(answer) ? answer : undefined,
      }));

      // Submit form
      await api.createSubmissionWithAnswers({
        formId,
        answers,
      });

      // Clear draft and navigate to success page
      localStorage.removeItem(this.storageKey);
      this.router.navigate(['/form-success']);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      this.loading.set(false);
    }
  }
  goBack() {
    this.location.back();
  }
}
