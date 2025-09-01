import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ComboSelectorComponent } from '../../../../components/shared/combo-selector/combo-selector.component';
import { SkeletonFormCardComponent } from '../../../../components/shared/skeleton-form-card/skeleton-form-card.component';
import {
  SubmissionCardComponent,
  Submission,
} from './submission-card/submission-card.component';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Form {
  formId: string;
  formTitle: string;
  formLanguage: string;
}

@Component({
  selector: 'app-view-submissions',
  imports: [
    CommonModule,
    TranslateModule,
    ComboSelectorComponent,
    SkeletonFormCardComponent,
    SubmissionCardComponent,
  ],
  templateUrl: './view-submissions.component.html',
  styleUrl: './view-submissions.component.scss',
})
export class ViewSubmissionsComponent {
  // Mock forms data - in real app this would come from an API
  forms: Form[] = [
    {
      formId: 'form-1',
      formTitle: 'Customer Feedback Form',
      formLanguage: 'en',
    },
    { formId: 'form-2', formTitle: 'Employee Survey', formLanguage: 'en' },
    { formId: 'form-3', formTitle: 'Project Evaluation', formLanguage: 'ar' },
    {
      formId: 'form-4',
      formTitle: 'Training Registration',
      formLanguage: 'en',
    },
  ];

  formsForSelector = this.forms.map((form) => ({
    id: form.formId,
    name: { en: form.formTitle, ar: form.formTitle },
  }));

  submissions: any[] = [];
  selectedFormId: string | undefined = undefined;
  isLoading = false;

  constructor() {}

  onFormSelected(formId: string | undefined) {
    this.selectedFormId = formId;

    if (formId) {
      this.loadSubmissionsForForm(formId).subscribe({
        next: (submissions) => this.onSubmissionsLoaded(submissions),
        error: (error) => this.onSubmissionsLoadError(error),
      });
    } else {
      // Clear submissions when no form is selected
      this.submissions = [];
      this.isLoading = false;
    }
  }

  get filteredSubmissions() {
    if (!this.selectedFormId) {
      return this.submissions;
    }
    return this.submissions.filter(
      (submission) => submission.formId === this.selectedFormId
    );
  }

  getFormTitle(formId?: string): string {
    if (!formId) return '';
    const form = this.forms?.find((f) => f.formId === formId);
    if (!form) return '';
    return form.formTitle;
  }

  // Mock API call - Angular Query compatible
  private loadSubmissionsForForm(formId: string): Observable<Submission[]> {
    this.isLoading = true;

    // Mock API response with delay (simulating network request)
    return of(this.getMockSubmissionsForForm(formId)).pipe(
      delay(2000) // 2 second delay to show loading
    );
  }

  private getMockSubmissionsForForm(formId: string): Submission[] {
    const form = this.forms.find((f) => f.formId === formId);
    const formTitle = form?.formTitle || `Form ${formId}`;

    return [
      {
        submissionId: `${formId}-sub-1`,
        formId: formId,
        formTitle: formTitle,
        userId: 'user-1',
        interviewId: 'interview-1',
        dateSubmitted: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        outcome: 'approved',
        decisionNotes: 'Submission approved after review',
      },
      {
        submissionId: `${formId}-sub-2`,
        formId: formId,
        formTitle: formTitle,
        userId: 'user-2',
        interviewId: 'interview-2',
        dateSubmitted: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        outcome: 'pending',
        decisionNotes: undefined,
      },
      {
        submissionId: `${formId}-sub-3`,
        formId: formId,
        formTitle: formTitle,
        userId: 'user-3',
        interviewId: 'interview-3',
        dateSubmitted: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        outcome: 'rejected',
        decisionNotes: 'Incomplete information provided',
      },
    ];
  }

  // Handle API call completion
  onSubmissionsLoaded(submissions: Submission[]) {
    this.submissions = submissions;
    this.isLoading = false;
  }

  onSubmissionsLoadError(error: any) {
    console.error('Error loading submissions:', error);
    this.isLoading = false;
    // Fallback to mock data
    this.submissions = this.getMockSubmissionsForForm(
      this.selectedFormId || 'form-1'
    );
  }
}
