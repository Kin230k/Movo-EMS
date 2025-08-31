import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { ComboSelectorComponent } from '../../../../../components/shared/combo-selector/combo-selector.component';
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

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      projectId: ['', Validators.required],
      name: ['', [Validators.required, Validators.maxLength(120)]],
    });
  }

  onProjectSelected(projectId: string | null) {
    this.form.get('projectId')?.setValue(projectId ?? '');
    this.form.get('projectId')?.markAsTouched();
    this.form.get('projectId')?.updateValueAndValidity();
  }

  onCancel() {
    this.form.reset();
    this.close.emit();
  }

  onCreate() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload: IInterview = {
      id: Date.now().toString(),
      projectId: this.form.get('projectId')?.value,
      name: this.form.get('name')?.value,
      createdAt: new Date().toISOString(),
    };
    this.create.emit(payload);
    this.form.reset();
  }
}
