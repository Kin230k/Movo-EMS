// add-schedule-modal.component.ts
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
import api from '../../../../../core/api/api';

@Component({
  selector: 'app-add-schedule-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './add-schedule-modal.component.html',
  styleUrls: ['./add-schedule-modal.component.scss'],
})
export class AddScheduleModalComponent implements OnInit, OnDestroy {
  @Input() projects: Array<{ id: string; name: { en: string; ar: string } }> =
    [];
  @Output() close = new EventEmitter<void>();
  @Output() refetch = new EventEmitter<void>();

  form!: FormGroup;
  isSubmitting = signal(false);
  errorMessage = signal('');

  constructor(private fb: FormBuilder) {
    this.buildForm();
  }

  ngOnInit() {
    // lock background scroll while modal exists
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
  }

  buildForm() {
    this.form = this.fb.group({
      projectId: ['', Validators.required],
      startDateTime: ['', Validators.required],
      endDateTime: ['', Validators.required],
      // optional: locationId may be present in the form later
      locationId: [''],
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

  // Helper: parse "YYYY-MM-DDTHH:mm" (seconds optional) into a Date built with LOCAL components.
  private parseLocalDatetime(local: string): Date {
    const [datePart = '', timePart = '00:00'] = local.split('T');
    const [y, m, d] = datePart.split('-').map((v) => Number(v));
    const timeParts = timePart.split(':').map((v) => Number(v));
    const hh = timeParts[0] ?? 0;
    const mm = timeParts[1] ?? 0;
    const ss = timeParts[2] ?? 0;
    // Construct Date using local components so it represents the local wall-clock moment.
    return new Date(y, (m || 1) - 1, d || 1, hh, mm, ss);
  }

  // Convert datetime-local string to ISO instant string (UTC) using local components.
  private localDatetimeToISOString(local: string): string {
    const d = this.parseLocalDatetime(local);
    return d.toISOString();
  }

  async onSave(evt?: MouseEvent) {
    evt?.stopPropagation();
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const projectId = this.form.value.projectId;
    const startLocal = this.form.value.startDateTime;
    const endLocal = this.form.value.endDateTime;
    const locationId = this.form.value.locationId ?? undefined;

    // Basic guard: ensure the strings exist
    if (!projectId) {
      this.errorMessage.set('Please select a project.');
      return;
    }
    if (!startLocal || !endLocal) {
      this.errorMessage.set('Please provide both start and end times.');
      return;
    }

    // Parse local datetimes into Date objects (local wall-clock moments)
    const startDate = this.parseLocalDatetime(startLocal);
    const endDate = this.parseLocalDatetime(endLocal);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      this.errorMessage.set('Invalid date/time format.');
      return;
    }

    // Validate end >= start
    if (endDate.getTime() < startDate.getTime()) {
      this.errorMessage.set('End time must be the same or after start time.');
      return;
    }

    const payload: any = {
      projectId,
      startTime: startDate.toISOString(), // correct ISO instant for server
      endTime: endDate.toISOString(),
    };

    if (locationId) payload.locationId = locationId;

    this.isSubmitting.set(true);

    try {
      const result: any = await api.createSchedule(payload);
      // You may want to check result.success depending on your API shape
      // Treat success when request doesn't throw
      this.refetch.emit();
      this.close.emit();
    } catch (error: any) {
      // Prefer the API's message if available
      this.errorMessage.set(
        (error && (error.message || error.error || error?.toString())) ||
          'An error occurred while creating schedule'
      );
      console.error('createSchedule error', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onClose(evt?: MouseEvent) {
    evt?.stopPropagation();
    this.close.emit();
  }
}
