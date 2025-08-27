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
  // create a new form group for the project
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
      badgeBackground: ['', Validators.required],
    });
  }

  patchForm(data: any) {
    this.form.patchValue({
      projectId: data?.projectId ?? '',
      nameAr: data?.name.ar ?? '',
      nameEn: data?.name.en ?? '',
      startingDate: data?.startingDate ?? '',
      endingDate: data?.endingDate ?? '',
      descriptionAr: data?.description.ar ?? '',
      descriptionEn: data?.description.en ?? '',
      badgeBackground: data?.badgeBackground ?? '',
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
