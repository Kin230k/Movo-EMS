import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComboSelectorComponent } from '../../../../components/shared/combo-selector/combo-selector.component';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { SkeletonFormCardComponent } from '../../../../components/shared/skeleton-form-card/skeleton-form-card.component';
import api from '../../../../core/api/api';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { IdentityService } from '../../../../core/services/identity.service';

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
  styleUrls: ['./emails.component.scss'],
})
export class EmailsComponent implements OnInit {
  // Tab management (two tabs only: Send and History)
  activeTab: 'compose' | 'history' = 'compose';

  // Forms loaded directly from API
  private _forms: Form[] = [];
  private _isFormsLoading = false;

  get forms(): Form[] {
    return this._forms;
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
  composeForm: FormGroup;

  constructor(private fb: FormBuilder, private identity: IdentityService) {
    // Initialize form immediately so template bindings are safe and the
    // disabled state works predictably even while async data loads.
    this.composeForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      body: ['', Validators.required],
      // If you later re-enable recipientType/customer fields, add them here
      // recipientType: ['users', Validators.required],
      // customRecipients: ['']
    });
  }

  async ngOnInit() {
    // Load forms for for each client or admin using identity service
    const who = await this.identity.getIdentity().catch(() => null);
    if (who?.isClient) {
      const data: any = await api.getFormsByClient({});
      const payload = (data as any)?.result ?? data ?? {};
      this._forms = Array.isArray(payload.forms)
        ? payload.forms.map((f: any) => ({
            id: String(f.formId ?? f.id),
            title: f.formTitle ?? f.title ?? 'Form',
          }))
        : [];
    } else {
      const data: any = await api.getAllForms({});
      const payload = (data as any)?.result ?? data ?? {};
      this._forms = Array.isArray(payload.forms)
        ? payload.forms.map((f: any) => ({
            id: String(f.formId ?? f.id),
            title: f.formTitle ?? f.title ?? 'Form',
          }))
        : [];
    }

    // Reset form to default values after initial load (keeps FormGroup instance)
    this.resetComposeForm();
  }

  async onHistoryFormSelected(formId: string | undefined) {
    this.selectedFormId = formId;
    this.emailHistory = [];

    if (formId) {
      // Load email templates
      try {
        const emails = await this.loadEmailsForForm(formId);
        this.onEmailsLoaded(emails);
      } catch (error) {
        this.onEmailsLoadError(error);
      }

      // Load email history
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
    } else {
      // Reset emails and history when no form is selected
      this.resetEmails();
      this.isLoading = false;
      this.isHistoryLoading = false;
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
      createdAt: new Date().toISOString(), // Mock created date
    };
  }

  // Load email templates for the selected form
  private async loadEmailsForForm(formId: string): Promise<any[]> {
    this.isLoading = true;
    try {
      const response = await api.getEmailsByForm({ formId });
      return response?.emails || [];
    } catch (error) {
      console.error('Error loading emails for form:', error);
      return [];
    } finally {
      this.isLoading = false;
    }
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

  onRecipientTypeChange() {
    // Reset form fields when recipient type changes
    this.composeForm.patchValue({
      email: '',
    });
  }

  onTemplateSelected(templateId: string) {
    if (templateId) {
      const template = this.emails.find((email) => email.id === templateId);
      if (template) {
        // Patch the template id so the form control exists and UI updates
        this.composeForm.patchValue({
          subject: template.title,
          body: template.body,
        });

        // If you want validations to run/update immediately:
        this.composeForm.get('subject')?.updateValueAndValidity();
        this.composeForm.get('body')?.updateValueAndValidity();
      }
    }
  }

  async sendEmail() {
    if (this.composeForm.valid) {
      try {
        const formData = this.composeForm.value;
        await api.sendEmail({
          email: formData.email,
          subject: formData.subject,
          body: formData.body,
        });

        const newHistoryItem = {
          id: Date.now().toString(),
          subject: formData.subject,
          sentAt: new Date(),
          body: formData.body,
        };
        this.emailHistory.unshift(newHistoryItem);
        this.resetComposeForm();
        this.setActiveTab('history');
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }
  }

  getRecipientCount(formData: any): number {
    switch (formData.recipientType) {
      case 'users':
        return 50; // Mock: all users
      case 'form':
        return 25; // Mock: form recipients
      case 'custom':
        return formData.email.split(',').length;
      default:
        return 0;
    }
  }

  resetComposeForm() {
    // Keep the same FormGroup instance to avoid template race conditions.
    this.composeForm.reset({
      email: '',
      subject: '',
      body: '',
    });

    // mark as pristine/touched states if needed
    this.composeForm.markAsPristine();
    this.composeForm.markAsUntouched();
  }

  openComposeModal() {
    this.setActiveTab('compose');
  }

  // Email card actions
  onEditEmail(emailData: any) {
    console.log('Edit email:', emailData);
  }

  onDuplicateEmail(emailData: any) {
    console.log('Duplicate email:', emailData);
  }

  onDeleteEmail(emailData: any) {
    console.log('Delete email:', emailData);
  }

  onSendEmail(emailData: any) {
    console.log('Send email template:', emailData);
    this.setActiveTab('compose');
    this.onTemplateSelected(emailData.emailId);
  }

  // History methods - now also loads email templates
  // The email history loading logic has been moved to the new onHistoryFormSelected method above
}
