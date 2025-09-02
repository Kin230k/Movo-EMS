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
import { Observable, of } from 'rxjs';
import { ApiQueriesService } from '../../../../core/services/queries.service';

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
  onlyManual: boolean | undefined;
  get formsForSelector() {
    return (this.forms || []).map((form) => ({
      id: form.formId,
      name: { en: form.formTitle, ar: form.formTitle },
    }));
  }

  submissions: any[] = [];
  selectedFormId: string | undefined = undefined;
  isLoading = false;

  constructor(
    private apiQueries: ApiQueriesService,
    private route: ActivatedRoute,
    private router: Router
  ) {
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

  onGoToManualQuestions(submissionId: string) {
    this.router.navigate(['/manual-questions/', submissionId]);
  }

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
    let list = this.submissions;
    if (this.selectedFormId) {
      list = list.filter(
        // call API to get the submissions for the form
        (submission) => submission.formId === this.selectedFormId
      );
    }
    if (this.onlyManual) {
      // call API to get the submissions for the form manual
      list = list.filter((submission) => submission.outcome === 'manual');
    }
    return list;
  }

  getFormTitle(formId?: string): string {
    if (!formId) return '';
    const form = this.forms?.find((f) => f.formId === formId);
    if (!form) return '';
    return form.formTitle;
  }

  private loadSubmissionsForForm(formId: string): Observable<Submission[]> {
    this.isLoading = true;
    return new Observable<Submission[]>((subscriber) => {
      (async () => {
        try {
          const q = this.apiQueries.getSubmissionsByFormQuery({
            formId,
            projectId: '',
          });
          const data = q.data?.() ?? [];
          const submissions = Array.isArray(data)
            ? data.map((s: any) => ({
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
          subscriber.next(submissions);
          subscriber.complete();
        } catch (e) {
          subscriber.error(e);
        }
      })();
    });
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

  private async loadForms() {
    const q = this.apiQueries.getFormByUserQuery({});
    const resp = q.data?.() ?? [];
    this.forms = Array.isArray(resp)
      ? resp.map((f: any) => ({
          formId: f.formId ?? f.id,
          formTitle: f.formTitle ?? f.title ?? 'Form',
          formLanguage: f.formLanguage ?? 'en',
        }))
      : [];
  }
}
