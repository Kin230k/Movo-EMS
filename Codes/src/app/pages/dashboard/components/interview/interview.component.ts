import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ComboSelectorComponent } from '../../../../components/shared/combo-selector/combo-selector.component';
import { CreateInterviewModalComponent } from './create-interview-modal/create-interview-modal.component';
import { Router } from '@angular/router';
import { ThemedButtonComponent } from '../../../../components/shared/themed-button/themed-button';
import { IdentityService } from '../../../../core/services/identity.service';
import { LanguageService } from '../../../../core/services/language.service';
import api from '../../../../core/api/api';
import { signal } from '@angular/core';
export interface IProject {
  id: string;
  name: { en: string; ar: string };
}

export interface IInterview {
  id: string;
  projectId: string;
  title: string;
  createdAt?: string;
  // later: questions, createdBy, status, etc.
}

@Component({
  selector: 'app-interview',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    ComboSelectorComponent,
    CreateInterviewModalComponent,
    ThemedButtonComponent,
  ],
  templateUrl: './interview.component.html',
  styleUrls: ['./interview.component.scss'],
})
export class InterviewerFormPageComponent {
  private _projects: any[] = [];

  @ViewChild(CreateInterviewModalComponent)
  createInterviewModal!: CreateInterviewModalComponent;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private identity: IdentityService,
    private translate: TranslateService,
    private language: LanguageService
  ) {
    this.form = this.fb.group({
      projectId: ['', Validators.required],
      interviewId: ['', Validators.required],
      userId: ['', Validators.required],
    });

    // Initialize the transformed interviews
    this.updateTransformedInterviews();
  }

  get projects(): IProject[] {
    return this._projects.map((p: any) => ({ id: p.projectId, name: p.name }));
  }

  interviews: IInterview[] = [];

  // UI state
  createInterviewModalVisible = false;
  // when Start Interview clicked we might open the QuestionEditModal or navigate
  selectedInterview?: IInterview;
  question: any = {}; // Current question being edited

  // Static array for combo selector
  transformedFilteredInterviews: {
    id: string;
    name: { en: string; ar: string };
  }[] = [];

  form: FormGroup;

  // User selection state
  userEmail = '';
  checkingEmail = signal(false);
  checkSucceeded = false;
  errorMessage = signal('');
  selectedUserId = signal('');

  get currentLang() {
    return this.language.currentLang;
  }

  // Update the static transformed interviews array
  private updateTransformedInterviews() {
    const pid = this.form.get('projectId')?.value;
    const filtered = pid
      ? this.interviews.filter((i) => i.projectId === pid)
      : this.interviews;

    this.transformedFilteredInterviews = filtered.map((interview) => ({
      id: interview.id,
      name: { en: interview.title, ar: interview.title }, // Use same name for both languages
    }));
  }
  async ngOnInit() {
    const who = await this.identity.getIdentity().catch(() => null);
    try {
      if (who?.isClient) {
        const data: any = await api.getProjectsByClient({});
        const payload = (data as any)?.result ?? data ?? {};
        this._projects = Array.isArray(payload.projects)
          ? payload.projects
          : [];
      } else {
        const data: any = await api.getAllProjects();
        const payload = (data as any)?.result ?? data ?? {};
        this._projects = Array.isArray(payload.projects)
          ? payload.projects
          : [];
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      this._projects = [];
    }
  }
  // handlers for ComboSelector
  async onProjectSelect(projectId: string | null) {
    this.form.get('projectId')?.setValue(projectId ?? '');
    // when project changes, filter interviews and clear interview selection
    this.form.get('interviewId')?.setValue('');
    // Update the transformed interviews list
    this.updateTransformedInterviews();
    if (projectId) {
      await this.loadInterviews(projectId);
    } else {
      this.interviews = [];
    }
  }

  onInterviewSelect(interviewId: string | null) {
    this.form.get('interviewId')?.setValue(interviewId ?? '');
  }

  // User email verification methods
  async checkEmailAsync(email: string): Promise<boolean> {
    this.checkingEmail.set(true);
    this.errorMessage.set('');
    try {
      const data: any = await api.getUserInfoByEmail({ email });
      const payload = (data as any)?.result ?? data ?? {};

      if (payload.success) {
        this.selectedUserId.set(payload.user.userId);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    } finally {
      this.checkingEmail.set(false);
    }
  }

  async onVerifyEmail() {
    if (!this.userEmail) {
      this.errorMessage.set(
        this.translate.instant('ADD_ROLE_MODAL.ERRORS.EMAIL_REQUIRED')
      );
      return;
    }
    this.errorMessage.set('');
    const result = await this.checkEmailAsync(this.userEmail);
    if (result) {
      this.checkSucceeded = true;
      this.form.get('userId')?.setValue(this.selectedUserId());
    } else {
      this.checkSucceeded = false;
      this.errorMessage.set(
        this.translate.instant('ADD_ROLE_MODAL.ERRORS.VERIFICATION_FAILED')
      );
    }
  }

  // open modal to create new interview
  onAddNewInterview() {
    this.createInterviewModalVisible = true;
  }

  // modal outputs
  async onCreateInterview(interview: IInterview) {
    try {
      const result = await api.createInterview({
        projectId: interview.projectId,
        title: interview.title,
      });

      if ((result as any).success) {
        // Reset modal state and close on success
        this.createInterviewModal.isCreating.set(false);
        this.createInterviewModal.createError.set('');
        this.createInterviewModal.form.reset();
        this.createInterviewModalVisible = false;

        // Refetch interviews to update the list
        await this.refetchInterviews();
      } else {
        // Show error message
        const errorMsg =
          (result as any).error ||
          this.translate.instant('COMMON.ERRORS.GENERIC_ERROR');
        this.createInterviewModal.createError.set(errorMsg);
        this.createInterviewModal.isCreating.set(false);
      }
    } catch (error) {
      console.error('Error creating interview:', error);
      // Show error message
      const errorMsg = this.translate.instant('COMMON.ERRORS.GENERIC_ERROR');
      this.createInterviewModal.createError.set(errorMsg);
      this.createInterviewModal.isCreating.set(false);
    }
  }

  // Refetch methods for modals
  async refetchProjects(): Promise<void> {
    const who = await this.identity.getIdentity().catch(() => null);
    try {
      if (who?.isClient) {
        const data: any = await api.getProjectsByClient({});
        const payload = (data as any)?.result ?? data ?? {};
        this._projects = Array.isArray(payload.projects)
          ? payload.projects
          : [];
      } else {
        const data: any = await api.getAllProjects();
        const payload = (data as any)?.result ?? data ?? {};
        this._projects = Array.isArray(payload.projects)
          ? payload.projects
          : [];
      }
    } catch (error) {
      console.error('Error refetching projects:', error);
    }
  }

  async refetchInterviews(): Promise<void> {
    const projectId = this.form.get('projectId')?.value;
    if (projectId) {
      await this.loadInterviews(projectId);
    }
  }

  async refetchAll(): Promise<void> {
    await this.refetchProjects();
    await this.refetchInterviews();
  }

  private async loadInterviews(projectId: string) {
    try {
      const data: any = await api.getInterviewByProject({ projectId });
      const payload = (data as any)?.result ?? data ?? {};
      if (Array.isArray(payload.interviews)) {
        this.interviews = payload.interviews.map((i: any) => ({
          id: i.interviewId ?? i.id,
          projectId: i.projectId ?? projectId,
          title: i.title ?? i.name ?? 'Interview',
          createdAt: i.createdAt,
        }));
      } else {
        this.interviews = [];
      }
    } catch (error) {
      console.error('Error loading interviews:', error);
      this.interviews = [];
    }

    this.updateTransformedInterviews();
  }

  onCancelCreateInterview() {
    this.createInterviewModalVisible = false;
    // Reset modal state when cancelled
    if (this.createInterviewModal) {
      this.createInterviewModal.isCreating.set(false);
      this.createInterviewModal.createError.set('');
    }
  }

  // start interview
  onStartInterview() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const interviewId = this.form.get('interviewId')?.value;
    const userId = this.form.get('userId')?.value;
    this.selectedInterview = this.interviews.find((i) => i.id === interviewId);
    // Show question editor modal (example) — in real app you'd route to an interview flow.
    // navigate to the interview page with userId parameter
    this.router.navigate(['/interviews/', interviewId], {
      queryParams: { userId },
    });
  }

  // filter interviews by selected project
  get filteredInterviews() {
    const pid = this.form.get('projectId')?.value;
    if (!pid) return this.interviews;
    return this.interviews.filter((i) => i.projectId === pid);
  }

  // transform filtered interviews to match ComboSelector interface
}
