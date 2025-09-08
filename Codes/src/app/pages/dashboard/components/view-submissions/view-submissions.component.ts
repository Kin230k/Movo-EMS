import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ComboSelectorComponent } from '../../../../components/shared/combo-selector/combo-selector.component';
import { ManualNavbarComponent } from '../../../../components/manual-navbar/manual-navbar.component';
import { SkeletonFormCardComponent } from '../../../../components/shared/skeleton-form-card/skeleton-form-card.component';
import {
  SubmissionCardComponent,
  Submission,
} from './submission-card/submission-card.component';
import api from '../../../../core/api/api';

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
    ManualNavbarComponent,
  ],
  templateUrl: './view-submissions.component.html',
  styleUrl: './view-submissions.component.scss',
})
export class ViewSubmissionsComponent {
  forms: Form[] = [];
  onlyManual: boolean = false;
  get formsForSelector() {
    return (this.forms || []).map((form) => ({
      id: form.formId,
      name: { en: form.formTitle, ar: form.formTitle },
    }));
  }

  submissions: any[] = [];
  selectedFormId: string | undefined = undefined;
  isLoading = false;
  submissionCardResetTriggers: { [key: string]: boolean } = {};

  constructor(private route: ActivatedRoute, private router: Router) {
    // Read optional route data flag to filter only manual submissions
    const data = this.route.snapshot.data as { onlyManual?: boolean };
    if (data && typeof data.onlyManual === 'boolean') {
      this.onlyManual = data.onlyManual;
    }
  }
  async ngOnInit() {
    await this.loadForms();
    // Set initial default form if needed
  }

  private async loadForms() {
    if (this.onlyManual) {
      try {
        const data: any = await api.getFormByUser({});
        const payload = (data as any)?.result ?? data ?? [];
        this.forms = Array.isArray(payload.form)
          ? payload.form.map((f: any) => ({
              formId: f.formId ?? f.id,
              formTitle: f.formTitle ?? f.title ?? 'Form',
              formLanguage: f.formLanguage ?? 'en',
            }))
          : [];
      } catch (error) {
        console.error('Error loading forms:', error);
        this.forms = [];
      }
    } else {
      try {
        const data: any = await api.getFormsByClient({});
        const payload = (data as any)?.result ?? data ?? [];
        this.forms = Array.isArray(payload.forms)
          ? payload.forms.map((f: any) => ({
              formId: f.formId ?? f.id,
              formTitle: f.formTitle ?? f.title ?? 'Form',
              formLanguage: f.formLanguage ?? 'en',
            }))
          : [];
      } catch (error) {
        console.error('Error loading forms:', error);
        this.forms = [];
      }
    }
  }

  onGoToManualQuestions(submissionId: string) {
    this.router.navigate(['/manual-questions/', submissionId]);
  }

  async onFormSelected(formId: string | undefined) {
    this.selectedFormId = formId;

    if (formId) {
      await this.loadSubmissionsForForm(formId);
    } else {
      // Clear submissions when no form is selected
      this.submissions = [];
      this.isLoading = false;
    }
  }

  get filteredSubmissions() {
    let list = this.submissions;
    if (this.selectedFormId) {
      list = list.filter(
        // call API to get the submissions for the form
        (submission) => submission.formId === this.selectedFormId
      );
    }
    if (this.onlyManual) {
      // call API to get the submissions for the form manual
      list = list.filter(
        (submission) => submission.outcome === 'MANUAL_REVIEW'
      );
    }
    return list;
  }

  getFormTitle(formId?: string): string {
    if (!formId) return '';
    const form = this.forms?.find((f) => f.formId === formId);
    if (!form) return '';
    return form.formTitle;
  }

  private async loadSubmissionsForForm(formId: string) {
    this.isLoading = true;
    try {
      const data: any = await api.getSubmissionsByForm({
        formId,
        projectId: '',
      });
      const payload = (data as any)?.result ?? data ?? [];
      const submissions = Array.isArray(payload.data)
        ? payload.data.map((s: any) => ({
            submissionId: s.submissionId ?? s.id,
            formId: s.formId ?? formId,
            formTitle: this.getFormTitle(s.formId ?? formId),
            userId: s.userId ?? '',
            interviewId: s.interviewId ?? '',
            dateSubmitted: s.dateSubmitted ?? new Date().toISOString(),
            outcome: s.outcome ?? 'pending',
            decisionNotes: s.decisionNotes,
          }))
        : [];
      this.onSubmissionsLoaded(submissions);
    } catch (e) {
      this.onSubmissionsLoadError(e);
    }
  }

  // Handle API call completion
  onSubmissionsLoaded(submissions: Submission[]) {
    this.submissions = submissions;
    this.isLoading = false;
  }

  onSubmissionsLoadError(error: any) {
    console.error('Error loading submissions:', error);
    this.isLoading = false;
    this.submissions = [];
  }
  async onStatusUpdated(data: {
    submissionId: string;
    outcome: string;
    decisionNotes?: string;
  }) {
    try {
      // Update local state immediately for optimistic UI
      this.submissions = this.submissions.map((submission) => {
        if (submission.submissionId === data.submissionId) {
          return { ...submission, ...data };
        }
        return submission;
      });

      // Make API call to update submission
      await api.updateSubmission({
        submissionId: data.submissionId,
        userId: undefined,
        outcome: data.outcome as 'ACCEPTED' | 'REJECTED' | 'MANUAL_REVIEW',
        decisionNotes: data.decisionNotes,
      });

      // Reset loading state on success after a short delay
      setTimeout(() => {
        this.onStatusUpdateComplete(data.submissionId);
      }, 500);
    } catch (error) {
      console.error('Error updating submission status:', error);
      // Reset loading state on error after a short delay
      setTimeout(() => {
        this.onStatusUpdateComplete(data.submissionId);
      }, 500);
      // Revert the optimistic update on error
      this.revertSubmissionUpdate(data.submissionId);
    }
  }

  onStatusUpdateComplete(submissionId: string) {
    // Trigger reset for the specific submission card
    this.submissionCardResetTriggers[submissionId] =
      !this.submissionCardResetTriggers[submissionId];
  }

  private revertSubmissionUpdate(submissionId: string) {
    // Revert the optimistic update if API call failed
    // This would require storing the previous state before the update
    console.warn('Submission update failed, reverting changes');
  }
}
