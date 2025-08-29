import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { StatusModalComponent } from './status-modal.component';
import { ThemedButtonComponent } from '../../../../../components/shared/themed-button/themed-button';

export interface Submission {
  submissionId: string;
  formId: string;
  formTitle: string;
  userId: string;
  interviewId: string;
  dateSubmitted: string;
  outcome?: string;
  decisionNotes?: string;
}

@Component({
  selector: 'app-submission-card',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    StatusModalComponent,
    ThemedButtonComponent,
  ],
  templateUrl: './submission-card.component.html',
  styleUrls: ['./submission-card.component.scss'],
})
export class SubmissionCardComponent {
  @Input() submission!: Submission;
  @Output() statusUpdated = new EventEmitter<{
    submissionId: string;
    outcome: string;
    decisionNotes?: string;
  }>();

  showStatusModal = false;
  statusDecisionNotes: string = '';

  // Provide strongly-typed values for bindings to the status modal
  private mapOutcomeToStatus(
    outcome?: string
  ): 'accepted' | 'rejected' | 'manual_review' | null {
    if (!outcome) return null;
    const o = outcome.toLowerCase();
    if (o === 'approved' || o === 'accepted') return 'accepted';
    if (o === 'rejected') return 'rejected';
    return 'manual_review';
  }

  get modalCurrentStatus(): 'accepted' | 'rejected' | 'manual_review' | null {
    return this.mapOutcomeToStatus(this.submission.outcome);
  }

  get modalDecisionNotes(): string | null {
    return this.submission.decisionNotes ?? null;
  }

  // Format date for display
  get formattedDate(): string {
    const date = new Date(this.submission.dateSubmitted);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  }

  // Get outcome badge class
  getOutcomeClass(): string {
    const outcome = this.submission.outcome?.toLowerCase();
    if (!outcome) return 'outcome-default';
    if (outcome === 'approved' || outcome === 'accepted')
      return 'outcome-approved';
    if (outcome === 'rejected') return 'outcome-rejected';
    if (outcome === 'pending' || outcome === 'manual_review')
      return 'outcome-pending';
    return 'outcome-default';
  }

  // Get outcome badge colors using CSS variables
  getOutcomeBadgeStyle(): { [key: string]: string } {
    const baseStyle = {
      padding: '0.25rem 0.75rem',
      'border-radius': '1rem',
      'font-size': '0.75rem',
      'font-weight': '600',
      'text-transform': 'uppercase',
    };

    const outcome = this.submission.outcome?.toLowerCase();
    if (outcome === 'approved' || outcome === 'accepted') {
      return {
        ...baseStyle,
        'background-color': 'var(--success)',
        color: 'white',
      };
    }
    if (outcome === 'rejected') {
      return {
        ...baseStyle,
        'background-color': 'var(--error)',
        color: 'white',
      };
    }
    if (outcome === 'pending' || outcome === 'manual_review') {
      return {
        ...baseStyle,
        'background-color': 'var(--btn-color)',
        color: 'white',
      };
    }

    return {
      ...baseStyle,
      'background-color': 'var(--color-medium-gray)',
      color: 'var(--color-dark-text)',
    };
  }

  openStatusModal() {
    // initialize modal state from current submission
    this.statusDecisionNotes = this.submission.decisionNotes || '';
    this.showStatusModal = true;
  }

  closeStatusModal() {
    this.showStatusModal = false;
  }

  onStatusSaved(event: {
    outcome: 'approved' | 'rejected' | 'pending';
    decisionNotes?: string;
  }) {
    this.submission.outcome = event.outcome;
    this.submission.decisionNotes = event.decisionNotes;

    this.statusUpdated.emit({
      submissionId: this.submission.submissionId,
      outcome: event.outcome,
      decisionNotes: event.decisionNotes,
    });

    this.showStatusModal = false;
  }
}
