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
import { FormQuestionDto } from '../../shared/types/form';
import { ThemedButtonComponent } from '../../components/shared/themed-button/themed-button';
import api from '../../core/api/api';

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
                [value]="'ACCEPTED'"
              />
              Accept All Questions
            </label>
            <label class="option">
              <input
                type="radio"
                name="final-review"
                [(ngModel)]="overallReview"
                [value]="'REJECTED'"
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
  overallReview: 'ACCEPTED' | 'REJECTED' | null = null;
  submissionId: string = '';
  reviewForm: FormGroup = new FormGroup({});

  constructor(private route: ActivatedRoute, private router: Router) {}

  async ngOnInit() {
    this.route.params.subscribe(async (params) => {
      this.submissionId = params['submissionId'];

      if (this.submissionId) {
        await this.fetchQuestions(this.submissionId);
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

  private async fetchQuestions(submissionId: string) {
    console.log('Fetching questions for submissionId:', submissionId);

    try {
      // Fetch manual answers by submission ID
      const manualData: any = await api.getManualAnswersBySubmissionId({
        submissionId,
        projectId: '', // You might need to get this from route params or context
      });

      const payload = (manualData as any)?.result ?? manualData ?? {};

      if (Array.isArray(payload.data)) {
        // Transform API data to component format
        this.manualQuestions = payload.data.map(
          (answer: any, index: number) => ({
            id: answer.questionId || `q-${index + 1}`,
            question: {
              questionId: answer.questionId,
              typeCode: this.mapAnswerTypeToQuestionType(answer.answerType),
              questionText: answer.questionText || 'Question',
              required: false,
              options: answer.options || [],
            },
            answer: this.extractAnswerValue(answer),
            submissionId,
            formTitle: payload.formTitle || 'Manual Review Form',
          })
        );
      } else {
        this.manualQuestions = [];
      }
    } catch (error) {
      console.error('Error fetching manual questions:', error);
      this.manualQuestions = [];
    }

    // Initialize form controls for review
    this.initializeFormControls();
  }

  private mapAnswerTypeToQuestionType(
    answerType: string
  ): FormQuestionDto['typeCode'] {
    switch (answerType) {
      case 'text':
        return 'OPEN_ENDED';
      case 'rating':
        return 'RATE';
      case 'numeric':
        return 'NUMBER';
      case 'options':
        return 'MULTIPLE_CHOICE';
      default:
        return 'OPEN_ENDED';
    }
  }

  private extractAnswerValue(answer: any): string | string[] {
    if (answer.optionIds && Array.isArray(answer.optionIds)) {
      return answer.optionIds;
    }
    if (answer.rating !== undefined) {
      return answer.rating.toString();
    }
    if (answer.numericResponse !== undefined) {
      return answer.numericResponse.toString();
    }
    return answer.textResponse || '';
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
  async submitReview() {
    if (!this.overallReview) {
      alert('Please select an overall review decision.');
      return;
    }

    try {
      // Get project ID - you might need to get this from route params or context
      const projectId = ''; // TODO: Get project ID from context

      const result = await api.updateSubmissionStatus({
        submissionId: this.submissionId,
        outcome: this.overallReview,
        decisionNotes: 'Manual review completed',
        projectId,
      });

      if ((result as any).success) {
        alert('Review submitted successfully!');
        this.router.navigate(['/manual-submissions']);
      } else {
        console.error('Error submitting review:', (result as any).error);
        alert('Error submitting review. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    }
  }
  goBack() {
    this.router.navigate(['/manual-submissions']);
  }
}
