import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ComboSelectorComponent } from '../../../../../components/shared/combo-selector/combo-selector.component';

@Component({
  selector: 'app-create-attendance-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ComboSelectorComponent,
  ],
  templateUrl: './create-attendance-modal.component.html',
  styleUrls: ['./create-attendance-modal.component.scss'],
})
export class CreateAttendanceModalComponent implements OnInit, OnChanges {
  /**
   * users: array of objects shaped like:
   * { id: string|number, name: { en: string, ar: string }, role?: string, picture?: string }
   */
  @Input() users: {
    id: number | string;
    name: { en: string; ar: string };
    role?: string;
    picture?: string;
  }[] = [];

  /**
   * areas: array of objects shaped like:
   * { id: string|number, name: { en: string, ar: string } }
   */
  @Input() areas: {
    id: number | string;
    name: { en: string; ar: string };
  }[] = [];

  @Input() preselectedUserId?: number | string | null;
  @Input() preselectedAreaId?: number | string | null;

  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<any>(); // emits created attendance object
  @Output() refetch = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      userId: ['', Validators.required],
      areaId: ['', Validators.required],
      isPresent: [true, Validators.required],
      attendanceTimestamp: ['', Validators.required],
    });
  }

  ngOnInit() {
    if (this.preselectedUserId) {
      this.form.get('userId')?.setValue(this.preselectedUserId);
    }
    if (this.preselectedAreaId) {
      this.form.get('areaId')?.setValue(this.preselectedAreaId);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['preselectedUserId'] && this.preselectedUserId) {
      this.form.get('userId')?.setValue(this.preselectedUserId);
    }
    if (changes['preselectedAreaId'] && this.preselectedAreaId) {
      this.form.get('areaId')?.setValue(this.preselectedAreaId);
    }
  }

  onUserSelected(userId: number | string | null) {
    this.form.get('userId')?.setValue(userId ?? '');
    this.form.get('userId')?.markAsTouched();
  }

  onAreaSelected(areaId: number | string | null) {
    this.form.get('areaId')?.setValue(areaId ?? '');
    this.form.get('areaId')?.markAsTouched();
  }

  onCancel() {
    this.close.emit();
  }

  onCreate() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const userId = val.userId;
    const areaId = val.areaId;

    const selectedUser =
      this.users.find((u) => String(u.id) === String(userId)) ?? null;
    const selectedArea =
      this.areas.find((a) => String(a.id) === String(areaId)) ?? null;

    const newAttendance = {
      userId,
      userName: selectedUser?.name ?? { en: '', ar: '' },
      areaId,
      areaName: selectedArea?.name ?? { en: '', ar: '' },
      role: selectedUser?.role,
      isPresent: !!val.isPresent,
      attendanceTimestamp: val.attendanceTimestamp
        ? new Date(val.attendanceTimestamp)
        : new Date(),
      picture: selectedUser?.picture || '/assets/images/image.png',
    };

    this.create.emit(newAttendance);
    this.refetch.emit();
  }
}
