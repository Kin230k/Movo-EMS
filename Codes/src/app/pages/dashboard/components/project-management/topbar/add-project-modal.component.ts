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

@Component({
  selector: 'app-add-project-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './add-project-modal.component.html',
  styleUrls: ['./add-project-modal.component.scss'],
})
export class AddProjectModalComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<any>();

  form!: FormGroup;
  dataLoaded = true;

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
      nameAr: ['', Validators.required],
      nameEn: ['', Validators.required],
      startingDate: ['', Validators.required],
      endingDate: ['', Validators.required],
      descriptionAr: ['', Validators.required],
      descriptionEn: ['', Validators.required],
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
    this.create.emit(this.form.value);
  }

  onClose(evt?: MouseEvent) {
    evt?.stopPropagation();
    this.close.emit();
  }
}
