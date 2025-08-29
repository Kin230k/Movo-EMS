import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComboSelectorComponent } from '../../../../components/shared/combo-selector/combo-selector.component';
import { TranslateModule } from '@ngx-translate/core';
import { EmailCardComponent } from './email-card.component';
import { SkeletonFormCardComponent } from '../../../../components/shared/skeleton-form-card/skeleton-form-card.component';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Form {
  id: string;
  title: string;
}

@Component({
  selector: 'app-emails',
  imports: [
    CommonModule,
    ComboSelectorComponent,
    TranslateModule,
    EmailCardComponent,
    SkeletonFormCardComponent,
  ],
  templateUrl: './emails.component.html',
  styleUrl: './emails.component.scss',
})
export class EmailsComponent {
  // Mock forms data - in real app this would come from an API
  forms: Form[] = [
    { id: '1', title: 'Customer Feedback Form' },
    { id: '2', title: 'Employee Survey' },
    { id: '3', title: 'Project Evaluation' },
    { id: '4', title: 'Training Registration' },
  ];

  formsForSelector = this.forms.map((form) => ({
    id: form.id,
    name: { en: form.title, ar: form.title },
  }));

  emails = [
    {
      id: '1',
      title: 'Customer Feedback Form',
      body: 'Customer Feedback Form Body',
      formId: '1',
    },
    {
      id: '2',
      title: 'Employee Survey',
      body: 'Employee Survey Body',
      formId: '2',
    },
    {
      id: '3',
      title: 'Project Evaluation',
      body: 'Project Evaluation Body',
      formId: '3',
    },
    {
      id: '4',
      title: 'Training Registration',
      body: 'Training Registration Body',
      formId: '4',
    },
  ];

  selectedFormId: string | undefined = undefined;
  isLoading = false;

  constructor(private http: HttpClient) {}

  onFormSelected(formId: string | undefined) {
    this.selectedFormId = formId;

    if (formId) {
      this.loadEmailsForForm(formId).subscribe({
        next: (emails) => this.onEmailsLoaded(emails),
        error: (error) => this.onEmailsLoadError(error),
      });
    } else {
      // Reset emails when no form is selected
      this.resetEmails();
      this.isLoading = false;
    }
  }

  get filteredEmails() {
    if (!this.selectedFormId) {
      return this.emails;
    }
    return this.emails.filter((email) => email.formId === this.selectedFormId);
  }

  getEmailData(email: any) {
    return {
      emailId: email.id,
      title: { en: email.title, ar: email.title }, // Simple mock for multilingual
      body: { en: email.body, ar: email.body }, // Simple mock for multilingual
      formId: email.formId,
      formTitle: this.getFormTitle(email.formId),
      createdAt: new Date().toISOString(), // Mock created date
    };
  }

  // Mock API call - Angular Query compatible
  private loadEmailsForForm(formId: string): Observable<any[]> {
    this.isLoading = true;

    // Mock API response with delay (simulating network request)
    return of(this.getMockEmailsForForm(formId)).pipe(
      delay(2000) // 2 second delay to show loading
    );
  }

  private getMockEmailsForForm(formId: string): any[] {
    return [
      {
        id: `${formId}-1`,
        title: `Email Template 1 for Form ${formId}`,
        body: `This is the body content for email template 1 related to form ${formId}`,
        formId: formId,
      },
      {
        id: `${formId}-2`,
        title: `Email Template 2 for Form ${formId}`,
        body: `This is the body content for email template 2 related to form ${formId}`,
        formId: formId,
      },
    ];
  }

  private resetEmails() {
    this.emails = [
      {
        id: '1',
        title: 'Customer Feedback Form',
        body: 'Customer Feedback Form Body',
        formId: '1',
      },
      {
        id: '2',
        title: 'Employee Survey',
        body: 'Employee Survey Body',
        formId: '2',
      },
      {
        id: '3',
        title: 'Project Evaluation',
        body: 'Project Evaluation Body',
        formId: '3',
      },
      {
        id: '4',
        title: 'Training Registration',
        body: 'Training Registration Body',
        formId: '4',
      },
    ];
  }

  getFormTitle(formId?: string): string {
    if (!formId) return '';
    const form = this.forms?.find((f) => f.id === formId);
    if (!form) return '';

    return form.title;
  }

  // Handle API call completion
  onEmailsLoaded(emails: any[]) {
    this.emails = emails;
    this.isLoading = false;
  }

  onEmailsLoadError(error: any) {
    console.error('Error loading emails:', error);
    this.isLoading = false;
    // Fallback to mock data
    this.emails = this.getMockEmailsForForm(this.selectedFormId || '1');
  }
}
