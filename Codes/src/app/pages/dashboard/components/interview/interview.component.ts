import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ComboSelectorComponent } from '../../../../components/shared/combo-selector/combo-selector.component';
import { CreateInterviewModalComponent } from './create-interview-modal/create-interview-modal.component';
import { Router } from '@angular/router';
import { ThemedButtonComponent } from '../../../../components/shared/themed-button/themed-button';
import { ApiQueriesService } from '../../../../core/services/queries.service';
import { IdentityService } from '../../../../core/services/identity.service';
export interface IProject {
  id: string;
  name: { en: string; ar: string };
}

export interface IInterview {
  id: string;
  projectId: string;
  name: string;
  createdAt?: string;
  // later: questions, createdBy, status, etc.
}

@Component({
  selector: 'app-interview',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ComboSelectorComponent,
    CreateInterviewModalComponent,
    ThemedButtonComponent,
  ],
  templateUrl: './interview.component.html',
  styleUrls: ['./interview.component.scss'],
})
export class InterviewerFormPageComponent {
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiQueries: ApiQueriesService,
    private identity: IdentityService
  ) {
    this.form = this.fb.group({
      projectId: ['', Validators.required],
      interviewId: ['', Validators.required],
    });

    // Initialize the transformed interviews
    this.updateTransformedInterviews();
  }

  projectsQuery: any;
  get projects(): IProject[] {
    const data = this.projectsQuery?.data() ?? [];
    return (data || []).map((p: any) => ({ id: p.projectId, name: p.name }));
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

  // Update the static transformed interviews array
  private updateTransformedInterviews() {
    const pid = this.form.get('projectId')?.value;
    const filtered = pid
      ? this.interviews.filter((i) => i.projectId === pid)
      : this.interviews;

    this.transformedFilteredInterviews = filtered.map((interview) => ({
      id: interview.id,
      name: { en: interview.name, ar: interview.name }, // Use same name for both languages
    }));
  }
  async ngOnInit() {
    const who = await this.identity.getIdentity().catch(() => null);
    if (who?.isClient) {
      this.projectsQuery = this.apiQueries.getProjectsByClientQuery({});
    } else {
      this.projectsQuery = this.apiQueries.getAllProjectsQuery();
    }
  }
  // handlers for ComboSelector
  onProjectSelect(projectId: string | null) {
    this.form.get('projectId')?.setValue(projectId ?? '');
    // when project changes, filter interviews and clear interview selection
    this.form.get('interviewId')?.setValue('');
    // Update the transformed interviews list
    this.updateTransformedInterviews();
    if (projectId) {
      this.loadInterviews(projectId);
    } else {
      this.interviews = [];
    }
  }

  onInterviewSelect(interviewId: string | null) {
    this.form.get('interviewId')?.setValue(interviewId ?? '');
  }

  // open modal to create new interview
  onAddNewInterview() {
    this.createInterviewModalVisible = true;
  }

  // modal outputs
  onCreateInterview(interview: IInterview) {
    const mutate = this.apiQueries.createInterviewMutation();
    mutate.mutate(
      {
        projectId: interview.projectId,
        name: interview.name,
      } as any,
      {
        onSuccess: () => {
          // refetch list and select the created one if possible
          this.loadInterviews(interview.projectId).then(() => {
            const created = this.interviews.find(
              (i) =>
                i.name === interview.name && i.projectId === interview.projectId
            );
            this.form.get('projectId')?.setValue(interview.projectId);
            if (created) this.form.get('interviewId')?.setValue(created.id);
            this.updateTransformedInterviews();
          });
          this.createInterviewModalVisible = false;
        },
      } as any
    );
  }

  private async loadInterviews(projectId: string) {
    const query = this.apiQueries.getInterviewByProjectQuery({ projectId });
    const resp = query.data?.() ?? [];
    this.interviews = Array.isArray(resp)
      ? resp.map((i: any) => ({
          id: i.interviewId ?? i.id,
          projectId: i.projectId ?? projectId,
          name: i.name ?? i.title ?? 'Interview',
          createdAt: i.createdAt,
        }))
      : [];
    this.updateTransformedInterviews();
  }

  onCancelCreateInterview() {
    this.createInterviewModalVisible = false;
  }

  // start interview
  onStartInterview() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const interviewId = this.form.get('interviewId')?.value;
    this.selectedInterview = this.interviews.find((i) => i.id === interviewId);
    // Show question editor modal (example) — in real app you'd route to an interview flow.
    // navigate to the interview page
    this.router.navigate(['/interviews/', interviewId]);
  }

  // filter interviews by selected project
  get filteredInterviews() {
    const pid = this.form.get('projectId')?.value;
    if (!pid) return this.interviews;
    return this.interviews.filter((i) => i.projectId === pid);
  }

  // transform filtered interviews to match ComboSelector interface
}
