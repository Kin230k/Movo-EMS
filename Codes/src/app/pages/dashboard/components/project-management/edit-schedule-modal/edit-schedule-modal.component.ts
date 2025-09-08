// edit-schedule-modal.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  OnInit,
  OnDestroy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ScheduleData } from '../schedule-card/schedule-card.component';

@Component({
  selector: 'app-edit-schedule-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './edit-schedule-modal.component.html',
  styleUrls: ['./edit-schedule-modal.component.scss'],
})
export class EditScheduleModalComponent implements OnInit, OnDestroy {
  @Input() schedule!: ScheduleData;
  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<{
    scheduleId: string;
    startDateTime: string;
    endDateTime: string;
  }>();

  form!: FormGroup;
  isSubmitting = signal(false);

  constructor(private fb: FormBuilder) {
    this.buildForm();
  }

  ngOnInit() {
    // lock background scroll while modal exists
    document.body.style.overflow = 'hidden';
    this.populateForm();
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
  }

  buildForm() {
    this.form = this.fb.group({
      startDateTime: ['', Validators.required],
      endDateTime: ['', Validators.required],
    });
  }

  // helper: pad numbers to 2 digits
  private pad(n: number) {
    return n.toString().padStart(2, '0');
  }

  /**
   * Build a "datetime-local" string (YYYY-MM-DDTHH:mm) from a Date using LOCAL components.
   * This ensures the <input type="datetime-local"> sees the correct wall-clock time for the user's timezone.
   */
  private toDatetimeLocal(d: Date): string {
    return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(
      d.getDate()
    )}T${this.pad(d.getHours())}:${this.pad(d.getMinutes())}`;
  }

  populateForm() {
    if (!this.schedule) return;

    // Parse ISO strings into Date objects (these are instants).
    // Use local getters to render the wall-clock time into the datetime-local input.
    const startDate = new Date(this.schedule.startDateTime);
    const endDate = new Date(this.schedule.endDateTime);

    const startDateTimeLocal = this.toDatetimeLocal(startDate);
    const endDateTimeLocal = this.toDatetimeLocal(endDate);

    this.form.patchValue({
      startDateTime: startDateTimeLocal,
      endDateTime: endDateTimeLocal,
    });
  }

  // keyboard: close on ESC
  @HostListener('document:keydown.escape', ['$event'])
  onEscape(_: KeyboardEvent) {
    this.close.emit();
  }

  onBackdropClick() {
    this.close.emit();
  }

  onSave(evt?: MouseEvent) {
    evt?.stopPropagation();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.form.value;
    // Emit the raw datetime-local string (YYYY-MM-DDTHH:mm).
    // Parent component will convert to ISO using local components to avoid timezone shifts.
    this.update.emit({
      scheduleId: this.schedule.scheduleId,
      startDateTime: formValue.startDateTime,
      endDateTime: formValue.endDateTime,
    });
    // Note: parent handles closing / success. If you'd rather reset isSubmitting here,
    // you can set it back to false after a timeout, or listen for a parent callback.
  }

  onClose(evt?: MouseEvent) {
    evt?.stopPropagation();
    this.close.emit();
  }
}
