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
import { FormService } from '../../core/services/form.service';
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
    `,
  ],
})
export class InterviewQuestionsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formService = inject(FormService);
  private readonly fb = inject(FormBuilder);

  loading = signal(true);
  title = signal('');
  meta = signal('');
  questions = signal<FormQuestionDto[]>([]);
  formGroup!: FormGroup;
  showErrors = signal(false);

  // storage key uses formId OR interviewId (prefer route param formId if present)
  private get storageKey(): string {
    const formId = this.route.snapshot.paramMap.get('formId');
    const interviewId = this.route.snapshot.paramMap.get('interviewId');
    const keyId = formId ?? interviewId ?? 'form';
    return `interview_form_answers_${keyId}`;
  }

  ngOnInit(): void {
    // allow either formId or interviewId — if interviewId you may want to fetch mapping
    const formId = this.route.snapshot.paramMap.get('formId');
    const interviewId = this.route.snapshot.paramMap.get('interviewId');
    const locationId =
      this.route.snapshot.queryParamMap.get('locationId') || undefined;
    const projectId =
      this.route.snapshot.queryParamMap.get('projectId') || undefined;

    const idToLoad = (formId ?? interviewId ?? 'default-form') as string;

    this.formService
      .getFormById(idToLoad, {
        locationId: locationId ?? undefined,
        projectId: projectId ?? undefined,
        interviewId: interviewId ?? undefined,
      })
      .subscribe((dto: DynamicFormDto) => {
        this.title.set(dto.formTitle);
        this.meta.set(
          `${dto.formLanguage?.toUpperCase() ?? 'EN'} • ${
            dto.questions.length
          } questions`
        );
        this.questions.set(dto.questions);
        this.buildForm(dto);
        this.restoreDraft();
        this.loading.set(false);
      });
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

  submit(): void {
    if (this.formGroup.invalid) {
      this.showErrors.set(true);
      this.formGroup.markAllAsTouched();
      return;
    }
    this.persistDraft();
    // Optionally navigate after submit
    alert('Interview answers submitted successfully!');
    // example navigation:
    // this.router.navigate(['/interviews']);
  }

  onBack() {
    // go back to previous page (interviewer list / interview detail)
    this.router.navigate(['/dashboard/interview']);
  }
}
