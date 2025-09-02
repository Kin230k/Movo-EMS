import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormQuestionDto, QuestionTypeCode } from '../../../shared/types/form';

// Import all question components
import { RadioQuestionComponent } from './radio-question.component';
import { DropdownQuestionComponent } from './dropdown-question.component';
import { MultipleChoiceQuestionComponent } from './multiple-choice-question.component';
import { NumberQuestionComponent } from './number-question.component';
import { RateQuestionComponent } from './rate-question.component';
import { ShortAnswerQuestionComponent } from './short-answer-question.component';
import { OpenEndedQuestionComponent } from './open-ended-question.component';

@Component({
  selector: 'app-dynamic-question-renderer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RadioQuestionComponent,
    DropdownQuestionComponent,
    MultipleChoiceQuestionComponent,
    NumberQuestionComponent,
    RateQuestionComponent,
    ShortAnswerQuestionComponent,
    OpenEndedQuestionComponent,
  ],
  template: `
    <div class="dynamic-question-container">
      <ng-container [ngSwitch]="question.typeCode">
        <!-- Radio Questions -->
        <app-radio-question
          *ngSwitchCase="'RADIO'"
          [question]="question"
          [control]="control"
          [showErrors]="showErrors"
          [disabled]="disabled"
        ></app-radio-question>

        <!-- Dropdown Questions -->
        <app-dropdown-question
          *ngSwitchCase="'DROPDOWN'"
          [question]="question"
          [control]="control"
          [showErrors]="showErrors"
          [disabled]="disabled"
        ></app-dropdown-question>

        <!-- Multiple Choice Questions -->
        <app-multiple-choice-question
          *ngSwitchCase="'MULTIPLE_CHOICE'"
          [question]="question"
          [control]="control"
          [showErrors]="showErrors"
          [disabled]="disabled"
        ></app-multiple-choice-question>

        <!-- Number Questions -->
        <app-number-question
          *ngSwitchCase="'NUMBER'"
          [question]="question"
          [control]="control"
          [showErrors]="showErrors"
          [disabled]="disabled"
        ></app-number-question>

        <!-- Rate Questions -->
        <app-rate-question
          *ngSwitchCase="'RATE'"
          [question]="question"
          [control]="control"
          [showErrors]="showErrors"
          [disabled]="disabled"
        ></app-rate-question>

        <!-- Short Answer Questions -->
        <app-short-answer-question
          *ngSwitchCase="'SHORT_ANSWER'"
          [question]="question"
          [control]="control"
          [showErrors]="showErrors"
          [disabled]="disabled"
        ></app-short-answer-question>

        <!-- Open Ended Questions -->
        <app-open-ended-question
          *ngSwitchCase="'OPEN_ENDED'"
          [question]="question"
          [control]="control"
          [showErrors]="showErrors"
          [disabled]="disabled"
        ></app-open-ended-question>

        <!-- Default case for unknown question types -->
        <div *ngSwitchDefault class="unknown-question-type">
          <p>Unknown question type: {{ question.typeCode }}</p>
          <p>Question: {{ question.questionText }}</p>
        </div>
      </ng-container>
    </div>
  `,
  styles: [
    `
      .dynamic-question-container {
        width: 100%;
      }

      .unknown-question-type {
        padding: 1rem;
        background: var(--bg-light);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-card);
        color: var(--color-text);
      }
    `,
  ],
})
export class DynamicQuestionRendererComponent {
  @Input() question!: FormQuestionDto;
  @Input() control!: FormControl;
  @Input() showErrors = false;
  @Input() disabled = false;
}
