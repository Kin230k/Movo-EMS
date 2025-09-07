import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { rolesBinding } from '../../../../../shared/types/roles';

@Component({
  selector: 'app-edit-attendance-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './edit-attendance-modal.component.html',
  styleUrls: ['./edit-attendance-modal.component.scss'],
})
export class EditAttendanceModalComponent implements OnInit {
  @Input() data!: {
    userId: number;
    name: { en: string; ar?: string };
    role: string;
    picture: string;
    isPresent: boolean;
    attendanceTimestamp: Date;
  } | null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  @Output() refetch = new EventEmitter<void>();

  form: ReturnType<FormBuilder['group']>;
  isSubmitting = signal(false);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      isPresent: [true],
      attendanceTimestamp: ['', Validators.required],
    });
  }

  roles: any = rolesBinding;

  get roleKeys(): string[] {
    return Object.keys(this.roles);
  }

  ngOnInit() {
    if (!this.data) return;
    this.form.patchValue({
      isPresent: !!this.data.isPresent,
      attendanceTimestamp: this.toInputDateTime(this.data.attendanceTimestamp),
    });
  }

  toInputDateTime(dt?: Date | string) {
    if (!dt) return '';
    const d = typeof dt === 'string' ? new Date(dt) : dt;
    // format YYYY-MM-DDTHH:mm for input[type=datetime-local]
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    const YYYY = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const DD = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
  }

  fromInputDateTime(val: string) {
    return val ? new Date(val) : null;
  }

  onCancel() {
    this.close.emit();
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const val = this.form.value;
    const payload = {
      ...this.data,
      isPresent: !!val.isPresent,
      attendanceTimestamp: this.fromInputDateTime(val.attendanceTimestamp),
    };
    this.save.emit(payload);
    this.refetch.emit();
  }
}
