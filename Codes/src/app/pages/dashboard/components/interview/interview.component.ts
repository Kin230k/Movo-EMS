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
  // sample projects — replace with real data from API
  projects: IProject[] = [
    { id: 'p1', name: { en: 'Project Alpha', ar: 'مشروع ألفا' } },
    { id: 'p2', name: { en: 'Project Beta', ar: 'مشروع بيتا' } },
  ];

  interviews: IInterview[] = [
    { id: 'i1', projectId: 'p1', name: 'Frontend Screening - Alice' },
    { id: 'i2', projectId: 'p2', name: 'Backend Screening - Bob' },
  ];

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

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      projectId: ['', Validators.required],
      interviewId: ['', Validators.required],
    });

    // Initialize the transformed interviews
    this.updateTransformedInterviews();
  }

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
  // handlers for ComboSelector
  onProjectSelect(projectId: string | null) {
    this.form.get('projectId')?.setValue(projectId ?? '');
    // when project changes, filter interviews and clear interview selection
    this.form.get('interviewId')?.setValue('');
    // Update the transformed interviews list
    this.updateTransformedInterviews();
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
    this.interviews = [interview, ...this.interviews];
    this.createInterviewModalVisible = false;
    // auto-select created interview
    this.form.get('projectId')?.setValue(interview.projectId);
    this.form.get('interviewId')?.setValue(interview.id);
    // Update the transformed interviews list
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
