import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  OnInit,
  OnChanges,
  SimpleChanges,
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
import { rolesLable } from '../../../../../../shared/types/roles';

@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.scss'],
})
export class ProfileModalComponent implements OnInit, OnChanges, OnDestroy {
  @Input() data: any;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<any>();
  @Output() disable = new EventEmitter<any>(); // kept for compatibility

  form!: FormGroup;
  dataLoaded = false;

  // roles list: value is the DB value, key is the translation key suffix (ROLES.KEY)
  roles = rolesLable;

  constructor(private fb: FormBuilder) {
    this.buildForm();
  }

  ngOnInit() {
    if (this.data) {
      this.patchForm(this.data);
      this.dataLoaded = true;
    }
    // lock background scroll while modal exists
    document.body.style.overflow = 'hidden';
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && changes['data'].currentValue) {
      this.patchForm(changes['data'].currentValue);
      this.dataLoaded = true;
    }
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
  }

  buildForm() {
    this.form = this.fb.group({
      projectId: ['', Validators.required],
      nameAr: ['', Validators.required],
      nameEn: ['', Validators.required],
      startingDate: ['', Validators.required],
      endingDate: ['', Validators.required],
      descriptionAr: ['', Validators.required],
      descriptionEn: ['', Validators.required],
    });
  }

  /**
   * Patches the form values and normalizes starting/ending dates to the
   * YYYY-MM-DD format expected by <input type="date">.
   */
  patchForm(data: any) {
    this.form.patchValue({
      projectId: data?.projectId ?? '',
      nameAr: data?.name?.ar ?? '',
      nameEn: data?.name?.en ?? '',
      startingDate: this.formatDateForInput(data?.startingDate),
      endingDate: this.formatDateForInput(data?.endingDate),
      descriptionAr: data?.description?.ar ?? '',
      descriptionEn: data?.description?.en ?? '',
    });
  }

  /**
   * Accepts many common date value shapes:
   * - JS Date
   * - number (seconds or milliseconds)
   * - ISO date string
   * - Firestore-like { seconds: number }
   * - objects with toDate()
   * Returns '' if the value cannot be parsed.
   *
   * Formats to local YYYY-MM-DD (so the date input shows the correct local date).
   */
  private formatDateForInput(val: any): string {
    if (val === null || val === undefined || val === '') return '';

    let d: Date | null = null;

    if (val instanceof Date) {
      d = val;
    } else if (typeof val === 'number') {
      // decide seconds vs milliseconds
      // numbers >= 1e12 are almost certainly ms; else treat as seconds
      const ms = val > 1e12 ? val : val * 1000;
      d = new Date(ms);
    } else if (typeof val === 'string') {
      const parsed = new Date(val);
      if (!isNaN(parsed.getTime())) d = parsed;
    } else if (typeof val === 'object') {
      if ('seconds' in val && typeof val.seconds === 'number') {
        // Firestore Timestamp-like
        d = new Date(val.seconds * 1000);
      } else if (typeof (val as any).toDate === 'function') {
        try {
          const maybeDate = (val as any).toDate();
          if (maybeDate instanceof Date && !isNaN(maybeDate.getTime()))
            d = maybeDate;
        } catch (e) {
          // ignore
        }
      } else if ('_seconds' in val && typeof val._seconds === 'number') {
        // another variant
        d = new Date(val._seconds * 1000);
      }
    }

    if (!d || isNaN(d.getTime())) return '';

    // Format as local YYYY-MM-DD (so the calendar shows the correct local date)
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
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
    if (!this.dataLoaded) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.edit.emit({
      projectId: this.data.projectId,
      name: { ar: this.form.value.nameAr, en: this.form.value.nameEn },
      startingDate: this.form.value.startingDate,
      endingDate: this.form.value.endingDate,
      description: {
        ar: this.form.value.descriptionAr,
        en: this.form.value.descriptionEn,
      },
    });
  }

  onDisable(evt?: MouseEvent) {
    evt?.stopPropagation();
    this.disable.emit(this.data);
  }

  onClose(evt?: MouseEvent) {
    evt?.stopPropagation();
    this.close.emit();
  }
}
