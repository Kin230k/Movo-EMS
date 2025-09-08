import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { signal } from '@angular/core';

import { ComboSelectorComponent } from '../../../../../components/shared/combo-selector/combo-selector.component';
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
  selector: 'app-create-interview-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ComboSelectorComponent,
  ],
  templateUrl: './create-interview-modal.component.html',
  styleUrls: ['./create-interview-modal.component.scss'],
})
export class CreateInterviewModalComponent {
  @Input() visible = false;
  @Input() projects: IProject[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<IInterview>();
  @Output() refetch = new EventEmitter<void>();

  form: FormGroup;

  // Loading and error states
  isCreating = signal(false);
  createError = signal('');

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      projectId: ['', Validators.required],
      name: ['', [Validators.maxLength(120)]],
    });
  }

  onProjectSelected(projectId: string | null) {
    this.form.get('projectId')?.setValue(projectId ?? '');
    this.form.get('projectId')?.markAsTouched();
    this.form.get('projectId')?.updateValueAndValidity();
  }

  onCancel() {
    this.form.reset();
    this.isCreating.set(false);
    this.createError.set('');
    this.close.emit();
  }

  onCreate() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Clear any previous error
    this.createError.set('');

    const payload: IInterview = {
      id: Date.now().toString(),
      projectId: this.form.get('projectId')?.value,
      title: this.form.get('name')?.value ?? 'Interview',
      createdAt: new Date().toISOString(),
    };

    // Set loading state
    this.isCreating.set(true);

    // Emit the payload for the parent to handle
    this.create.emit(payload);
  }
}
