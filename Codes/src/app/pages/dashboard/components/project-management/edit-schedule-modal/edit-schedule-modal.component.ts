import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  OnInit,
  OnDestroy,
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

  populateForm() {
    if (this.schedule) {
      // Convert ISO string to datetime-local format (YYYY-MM-DDTHH:mm)
      const startDate = new Date(this.schedule.startDateTime);
      const endDate = new Date(this.schedule.endDateTime);

      const startDateTimeLocal = startDate.toISOString().slice(0, 16);
      const endDateTimeLocal = endDate.toISOString().slice(0, 16);

      this.form.patchValue({
        startDateTime: startDateTimeLocal,
        endDateTime: endDateTimeLocal,
      });
    }
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

    const formValue = this.form.value;
    this.update.emit({
      scheduleId: this.schedule.scheduleId,
      startDateTime: formValue.startDateTime,
      endDateTime: formValue.endDateTime,
    });
  }

  onClose(evt?: MouseEvent) {
    evt?.stopPropagation();
    this.close.emit();
  }
}
