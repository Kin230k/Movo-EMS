import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComboSelectorComponent } from '../../../../components/shared/combo-selector/combo-selector.component';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { SkeletonFormCardComponent } from '../../../../components/shared/skeleton-form-card/skeleton-form-card.component';
import { ApiQueriesService } from '../../../../core/services/queries.service';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

export interface Form {
  id: string;
  title: string;
}

@Component({
  selector: 'app-emails',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ComboSelectorComponent,
    TranslateModule,
    SkeletonFormCardComponent,
  ],
  templateUrl: './emails.component.html',
  styleUrl: './emails.component.scss',
})
export class EmailsComponent implements OnInit {
  // Tab management (two tabs only: Send and History)
  activeTab: 'compose' | 'history' = 'compose';

  // Forms loaded via queries.service.ts
  formsQuery: any;
  get forms(): Form[] {
    const resp = this.formsQuery?.data?.() ?? [];
    return Array.isArray(resp)
      ? resp.map((f: any) => ({
          id: String(f.formId ?? f.id),
          title: f.formTitle ?? f.title ?? 'Form',
        }))
      : [];
  }
  get formsForSelector() {
    return (this.forms || []).map((form) => ({
      id: form.id,
      name: { en: form.title, ar: form.title },
    }));
  }

  // Email templates list (awaiting backend endpoint). Keep empty to avoid mocks.
  emails: Array<{ id: string; title: string; body: string; formId: string }> =
    [];

  // Email history data (loaded per selected form)
  emailHistory: Array<{
    id: string;
    subject: string;
    sentAt: Date;
    body: string;
  }> = [];

  isHistoryLoading = false;

  selectedFormId: string | undefined = undefined;
  isLoading = false;

  // Compose form
  composeForm!: FormGroup;

  constructor(private fb: FormBuilder, private apiQueries: ApiQueriesService) {}

  ngOnInit() {
    // Load forms for selectors via query
    this.formsQuery = this.apiQueries.getFormByUserQuery({});
    this.initializeComposeForm({
      recipientType: 'users',
      customRecipients: '',
      templateId: '',
      subject: '',
      body: '',
    });
  }

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

  // Placeholder until email templates endpoint exists
  private loadEmailsForForm(formId: string): Observable<any[]> {
    this.isLoading = true;
    // No backend yet → return empty array without artificial delay
    return of([]);
  }

  // Placeholder until email history endpoint exists
  private loadEmailHistoryForForm(formId: string): Observable<any[]> {
    this.isHistoryLoading = true;
    // No backend yet → return empty array without artificial delay
    return of([]);
  }

  private resetEmails() {
    this.emails = [];
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
    this.emails = [];
  }

  // Tab management
  setActiveTab(tab: 'compose' | 'history') {
    this.activeTab = tab;
  }

  // Compose form methods
  initializeComposeForm(initialValue: any) {
    this.composeForm = this.fb.group({
      email: [
        initialValue?.email || '',
        [Validators.required, Validators.email],
      ], // <-- ADDED
      formId: [initialValue?.formId || null],
      recipientType: [
        initialValue?.recipientType || 'users',
        Validators.required,
      ],
      customRecipients: [initialValue?.customRecipients || ''],
      templateId: [initialValue?.templateId || ''],
      subject: [initialValue?.subject || '', Validators.required],
      body: [initialValue?.body || '', Validators.required],
    });
  }

  onRecipientTypeChange() {
    // Reset form fields when recipient type changes
    this.composeForm.patchValue({
      customRecipients: '',
      templateId: '',
    });
  }

  onTemplateSelected(templateId: string) {
    if (templateId) {
      const template = this.emails.find((email) => email.id === templateId);
      if (template) {
        // Patch the template id so the form control exists and UI updates
        this.composeForm.patchValue({
          templateId: templateId,
          subject: template.title,
          body: template.body,
        });

        // If you want validations to run/update immediately:
        this.composeForm.get('subject')?.updateValueAndValidity();
        this.composeForm.get('body')?.updateValueAndValidity();
      }
    }
  }

  sendEmail() {
    if (this.composeForm.valid) {
      const formData = this.composeForm.value;
      const mutate = this.apiQueries.sendEmailMutation();
      mutate.mutate(
        {
          email: formData.email,
          subject: formData.subject,
          body: formData.body,
        },
        {
          onSuccess: () => {
            const newHistoryItem = {
              id: Date.now().toString(),
              subject: formData.subject,
              sentAt: new Date(),
              body: formData.body,
            };
            this.emailHistory.unshift(newHistoryItem);
            this.resetComposeForm();
            this.setActiveTab('history');
            alert('Email sent successfully!');
          },
        } as any
      );
    }
  }

  getRecipientCount(formData: any): number {
    switch (formData.recipientType) {
      case 'users':
        return 50; // Mock: all users
      case 'form':
        return 25; // Mock: form recipients
      case 'custom':
        return formData.customRecipients.split(',').length;
      default:
        return 0;
    }
  }

  resetComposeForm() {
    this.composeForm.reset({
      recipientType: 'users',
      customRecipients: '',
      templateId: '',
      subject: '',
      body: '',
    });
  }

  openComposeModal() {
    this.setActiveTab('compose');
  }

  // Email card actions
  onEditEmail(emailData: any) {
    console.log('Edit email:', emailData);
    // Navigate to edit modal or page
  }

  onDuplicateEmail(emailData: any) {
    console.log('Duplicate email:', emailData);
    // Create duplicate template
  }

  onDeleteEmail(emailData: any) {
    console.log('Delete email:', emailData);
    // Show delete confirmation
  }

  onSendEmail(emailData: any) {
    console.log('Send email template:', emailData);
    // Pre-populate compose form with template data
    this.setActiveTab('compose');
    this.onTemplateSelected(emailData.emailId);
  }

  // History methods
  onHistoryFormSelected(formId: string | undefined) {
    this.selectedFormId = formId;
    this.emailHistory = [];
    if (!formId) {
      this.isHistoryLoading = false;
      return;
    }
    this.loadEmailHistoryForForm(formId).subscribe({
      next: (items) => {
        this.emailHistory = items as any;
        this.isHistoryLoading = false;
      },
      error: () => {
        this.emailHistory = [];
        this.isHistoryLoading = false;
      },
    });
  }
}
