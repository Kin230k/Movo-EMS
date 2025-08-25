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
  roles = [
    { value: 'Marshall', key: 'MARSHALL' },
    { value: 'Supervisor', key: 'SUPERVISOR' },
    { value: 'Senior Supervisor', key: 'SENIOR_SUPERVISOR' },
    { value: 'Super Admin', key: 'SUPER_ADMIN' },
    { value: 'Main User', key: 'MAIN_USER' },
    { value: 'System Admin', key: 'SYSTEM_ADMIN' },
  ];

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
      userId: [null],
      role: ['', Validators.required],
      rate: ['', Validators.required],
    });
  }

  patchForm(data: any) {
    this.form.patchValue({
      userId: data?.userId ?? null,
      role: data?.role ?? '',
      rate: data?.rate ?? '',
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
    if (!this.dataLoaded) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.edit.emit(this.form.value);
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
