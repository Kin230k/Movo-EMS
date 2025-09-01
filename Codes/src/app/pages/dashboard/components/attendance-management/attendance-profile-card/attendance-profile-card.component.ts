import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../../core/services/language.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { rolesBinding } from '../../../../../shared/types/roles';
import { EditAttendanceModalComponent } from './edit-attendance-modal.component';
import { DeleteModalComponent } from '../../../../../components/shared/delete-modal/delete-modal.component';

@Component({
  selector: 'app-attendance-profile-card',
  templateUrl: './attendance-profile-card.component.html',
  styleUrls: ['./attendance-profile-card.component.scss'],
  imports: [
    CommonModule,
    TranslateModule,
    DeleteModalComponent,
    EditAttendanceModalComponent,
  ],
  standalone: true,
})
export class AttendanceProfileCardComponent implements OnInit, OnDestroy {
  @Input() data!: {
    userId: number;
    name: { en: string; ar: string } | string;
    role: string;
    picture: string;
    isPresent: boolean;
    attendanceTimestamp: Date;
  };

  @Output() edit = new EventEmitter<any>(); // emits updated attendance object
  @Output() delete = new EventEmitter<number>(); // emits userId to delete

  modalOpen = false;
  showDeleteModal = false;
  showEditModal = false;

  private destroy$ = new Subject<void>();

  constructor(
    public language: LanguageService,
    private translate: TranslateService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.cd.markForCheck();
    });
  }

  roles: any = rolesBinding;

  getRole() {
    return this.roles[this.data.role];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get displayName(): string {
    if (!this.data) return '';
    const name = this.data.name;
    if (!name) return '';
    if (typeof name === 'string') return name;

    const lang: 'en' | 'ar' =
      this.language.currentLang ||
      (document.documentElement.dir === 'rtl' ? 'ar' : 'en');
    return name[lang] || name['en'] || Object.values(name)[0] || '';
  }

  // Transform data for edit modal to match expected interface
  get modalData() {
    if (!this.data) return null;

    const name = this.data.name;
    let formattedName: { en: string; ar?: string };

    if (typeof name === 'string') {
      formattedName = { en: name };
    } else {
      formattedName = { en: name.en, ar: name.ar };
    }

    return {
      ...this.data,
      name: formattedName,
    };
  }

  get displayDate() {
    const locale = this.translate.currentLang || 'en';
    // guard in case attendanceTimestamp is string
    const dt = this.data.attendanceTimestamp
      ? new Date(this.data.attendanceTimestamp)
      : new Date();
    return dt.toLocaleString(locale, {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Edit handlers
  openEdit(evt?: MouseEvent) {
    evt?.stopPropagation();
    this.showEditModal = true;
  }

  closeEdit() {
    this.showEditModal = false;
  }

  onSaveEdit(updated: any) {
    this.showEditModal = false;
    // emit updated payload to parent to persist
    this.edit.emit(updated);
  }

  // Delete handlers
  openDelete(evt?: MouseEvent) {
    evt?.stopPropagation();
    this.showDeleteModal = true;
  }

  closeDelete() {
    this.showDeleteModal = false;
  }

  confirmDelete() {
    this.showDeleteModal = false;
    this.delete.emit(this.data.userId);
  }
}
