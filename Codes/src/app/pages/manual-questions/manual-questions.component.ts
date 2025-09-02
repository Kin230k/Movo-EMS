import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicQuestionRendererComponent } from '../../components/form/questions/dynamic-question-renderer.component';
import { FormQuestionDto, QuestionTypeCode } from '../../shared/types/form';
import { ThemedButtonComponent } from '../../components/shared/themed-button/themed-button';

type ManualQuestion = {
  id: string;
  question: FormQuestionDto;
  answer: string | string[];
  formTitle: string;
  submissionId: string;
};

@Component({
  selector: 'app-manual-questions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    DynamicQuestionRendererComponent,
    ThemedButtonComponent,
  ],
  template: `
    <!-- create a go back button -->
    <button class="go-back-button" (click)="goBack()">
      {{ 'MANUAL_QUESTIONS.GO_BACK' | translate : { default: 'Go Back' } }}
    </button>
    <div class="manual-questions-container">
      <div class="header-section">
        <h1>
          {{
            'MANUAL_QUESTIONS.TITLE'
              | translate : { default: 'Manual Questions' }
          }}
        </h1>
      </div>

      <div class="content-section">
        <div *ngIf="manualQuestions.length === 0" class="no-questions">
          <p>
            {{
              'MANUAL_QUESTIONS.EMPTY'
                | translate : { default: 'No manual questions found' }
            }}
          </p>
        </div>

        <div class="questions-grid" *ngIf="manualQuestions.length > 0">
          <div
            class="question-card"
            *ngFor="let q of manualQuestions; let i = index"
          >
            <!-- Dynamic Question Renderer for Review -->
            <div class="review-question">
              <h4>Question:</h4>
              <app-dynamic-question-renderer
                [question]="q.question"
                [control]="getFormControl(i)"
                [showErrors]="false"
                [disabled]="true"
              ></app-dynamic-question-renderer>
            </div>
          </div>
        </div>

        <!-- Review Controls at the end -->
        <div class="review-section" *ngIf="manualQuestions.length > 0">
          <h3>Final Review</h3>
          <div class="review-control">
            <label class="option">
              <input
                type="radio"
                name="final-review"
                [(ngModel)]="overallReview"
                [value]="'accepted'"
              />
              Accept All Questions
            </label>
            <label class="option">
              <input
                type="radio"
                name="final-review"
                [(ngModel)]="overallReview"
                [value]="'failed'"
              />
              Fail All Questions
            </label>
          </div>
        </div>
        <div class="submit-button">
          <themed-button
            (click)="submitReview()"
            text="{{
              'MANUAL_QUESTIONS.SUBMIT' | translate : { default: 'Submit' }
            }}"
          >
          </themed-button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .manual-questions-container {
        margin: 0 auto;
        margin-top: 2rem;
        padding: 2rem;
        max-width: 1200px;
      }

      .go-back-button {
        all: unset;
        cursor: pointer;
        font-size: 1.2rem;
        font-weight: 600;
        padding: 0.5rem 1rem;
        border-radius: var(--radius-card);
        border: 1px solid var(--color-text);
        margin-top: 1rem;
        margin-left: 1rem;
      }

      .header-section {
        text-align: center;
        margin-bottom: 2rem;

        h1 {
          font-size: 2.5rem;
          margin: 0 0 0.5rem 0;
        }
      }

      .content-section {
        margin-bottom: 2rem;
      }

      .review-section {
        margin-top: 2rem;
        padding: 2rem;
        border: 1px solid var(--color-text);
        border-radius: var(--radius-card);
        text-align: center;

        h3 {
          margin: 0 0 1.5rem 0;
          color: var(--bg-dark);
          font-size: 1.5rem;
        }

        .review-control {
          display: flex;
          justify-content: center;
          gap: 2rem;
          color: var(--bg-dark);

          .option {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--bg-dark);
            cursor: pointer;
            font-size: 1.1rem;

            input[type='radio'] {
              margin: 0;
            }
          }
        }
      }

      .questions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .question-card {
        padding: 1.5rem;
        border-radius: var(--radius-card);
        border: 1px solid var(--color-text);

        .question-text {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--white);
        }

        .answer-text {
          margin-bottom: 0.75rem;
          color: var(--bg-dark);

          .label {
            font-weight: 600;
            margin-right: 0.5rem;
          }

          .value {
            color: var(--bg-dark);
          }
        }

        .question-meta {
          color: var(--bg-dark);
          font-size: 0.875rem;
        }

        .original-question {
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--color-border);
        }

        .review-question {
          margin-top: 1rem;

          h4 {
            margin: 0 0 0.5rem 0;
            font-size: 1rem;
            font-weight: 600;
          }
        }
      }

      .no-questions {
        text-align: center;
        padding: 3rem;
        background: var(--bg-dark);
        border-radius: var(--radius-card);
        box-shadow: 0 6px 0 rgba(var(--bg-dark-rgb), 0.25) inset;

        p {
          font-size: 1.1rem;
          color: var(--bg-dark);
          margin: 0;
        }
      }

      @media (max-width: 768px) {
        .manual-questions-container {
          padding: 1rem;
        }

        .header-section {
          margin-bottom: 1.5rem;

          h1 {
            font-size: 2rem;
          }
        }

        .questions-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
        }
      }
      .submit-button {
        margin-top: 1rem;
        margin-inline: auto;
        width: 10rem;
        align-self: center;
      }
    `,
  ],
})
export class ManualQuestionsComponent implements OnInit {
  manualQuestions: ManualQuestion[] = [];
  overallReview: 'accepted' | 'failed' | null = null;
  submissionId: string = '';
  reviewForm: FormGroup = new FormGroup({});

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.submissionId = params['submissionId'];

      if (this.submissionId) {
        this.fetchQuestions(this.submissionId);
      } else {
        console.warn('No submissionId found in route parameters');
        // Load default questions or show error
        this.loadDefaultQuestions();
      }
    });
  }

  getFormControl(index: number): FormControl {
    const controlName = `question_${index}`;
    if (!this.reviewForm.contains(controlName)) {
      this.reviewForm.addControl(controlName, new FormControl(''));
    }
    return this.reviewForm.get(controlName) as FormControl;
  }

  getAnswerDisplay(answer: string | string[]): string {
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    return answer;
  }

  private loadDefaultQuestions() {
    // Load some default questions when no submissionId is provided
    this.manualQuestions = [
      {
        id: 'q-default-1',
        question: {
          questionId: 'q-default-1',
          typeCode: 'OPEN_ENDED',
          questionText: 'Default question - please describe any issues.',
          required: false,
        },
        answer: 'No specific answer provided.',
        submissionId: 'default',
        formTitle: 'Default Form',
      },
    ];
  }

  private fetchQuestions(submissionId: string) {
    console.log('Fetching questions for submissionId:', submissionId);

    // Mock data - replace with actual API call
    const mockQuestions: Record<string, ManualQuestion[]> = {
      'form-2-sub-2': [
        {
          id: 'q-1',
          question: {
            questionId: 'q-1',
            typeCode: 'OPEN_ENDED',
            questionText: 'Please describe the issue encountered.',
            required: true,
          },
          answer: 'The app crashes when clicking save on the profile page.',
          submissionId: 'form-2',
          formTitle: 'Employee Survey',
        },
        {
          id: 'q-2',
          question: {
            questionId: 'q-2',
            typeCode: 'RADIO',
            questionText: 'What is the severity of this issue?',
            required: true,
            options: [
              { optionId: 'low', optionText: 'Low' },
              { optionId: 'medium', optionText: 'Medium' },
              { optionId: 'high', optionText: 'High' },
              { optionId: 'critical', optionText: 'Critical' },
            ],
          },
          answer: 'high',
          submissionId: 'form-2',
          formTitle: 'Employee Survey',
        },
        {
          id: 'q-3',
          question: {
            questionId: 'q-3',
            typeCode: 'MULTIPLE_CHOICE',
            questionText: 'Which symptoms are you experiencing?',
            required: false,
            options: [
              { optionId: 'crash', optionText: 'App crashes' },
              { optionId: 'slow', optionText: 'Slow performance' },
              { optionId: 'error', optionText: 'Error messages' },
              { optionId: 'ui', optionText: 'UI glitches' },
            ],
          },
          answer: ['crash', 'slow'],
          submissionId: 'form-2',
          formTitle: 'Employee Survey',
        },
      ],
      'form-4': [
        {
          id: 'q-4',
          question: {
            questionId: 'q-4',
            typeCode: 'DROPDOWN',
            questionText: 'What is your role in the training program?',
            required: true,
            options: [
              { optionId: 'trainer', optionText: 'Trainer' },
              { optionId: 'trainee', optionText: 'Trainee' },
              { optionId: 'coordinator', optionText: 'Coordinator' },
              { optionId: 'observer', optionText: 'Observer' },
            ],
          },
          answer: 'trainee',
          submissionId: 'form-4',
          formTitle: 'Training Registration',
        },
        {
          id: 'q-5',
          question: {
            questionId: 'q-5',
            typeCode: 'NUMBER',
            questionText: 'How many years of experience do you have?',
            required: false,
            min: 0,
            max: 50,
          },
          answer: '3',
          submissionId: 'form-4',
          formTitle: 'Training Registration',
        },
        {
          id: 'q-6',
          question: {
            questionId: 'q-6',
            typeCode: 'RATE',
            questionText:
              'How would you rate your satisfaction with the training?',
            required: true,
            min: 1,
            max: 5,
          },
          answer: '4',
          submissionId: 'form-4',
          formTitle: 'Training Registration',
        },
        {
          id: 'q-7',
          question: {
            questionId: 'q-7',
            typeCode: 'SHORT_ANSWER',
            questionText: 'What is your full name?',
            required: true,
          },
          answer: 'John Doe',
          submissionId: 'form-4',
          formTitle: 'Training Registration',
        },
      ],
      'form-1-sub-2': [
        {
          id: 'q-8',
          question: {
            questionId: 'q-8',
            typeCode: 'RADIO',
            questionText: 'Please verify the submission details.',
            required: true,
            options: [
              {
                optionId: 'verified',
                optionText: 'Verified - All details correct',
              },
              {
                optionId: 'needs_review',
                optionText: 'Needs review - Issues found',
              },
              {
                optionId: 'rejected',
                optionText: 'Rejected - Invalid submission',
              },
            ],
          },
          answer: 'verified',
          submissionId: 'form-1-sub-2',
          formTitle: 'Submission Verification',
        },
      ],
    };

    this.manualQuestions = mockQuestions[submissionId] || [];
    console.log(
      'Loaded questions:',
      this.manualQuestions.length,
      'questions found'
    );

    // Initialize form controls for review
    this.initializeFormControls();
  }

  private initializeFormControls() {
    // Clear existing controls
    Object.keys(this.reviewForm.controls).forEach((key) => {
      this.reviewForm.removeControl(key);
    });

    // Add controls for each question
    this.manualQuestions.forEach((question, index) => {
      const controlName = `question_${index}`;
      const currentValue = question.answer;
      this.reviewForm.addControl(controlName, new FormControl(currentValue));
      // Disable control in manual review mode so it's non-interactive
      const ctl = this.reviewForm.get(controlName);
      if (ctl) {
        ctl.disable({ emitEvent: false });
      }
    });
  }
  submitReview() {
    // TODO: Implement submit review
    console.log('Submitting review');
    console.log(this.overallReview);
    console.log(this.reviewForm.value);
    console.log(this.manualQuestions);
    console.log(this.submissionId);
    console.log(this.reviewForm.value);
  }
  goBack() {
    this.router.navigate(['/manual-submissions']);
  }
}
