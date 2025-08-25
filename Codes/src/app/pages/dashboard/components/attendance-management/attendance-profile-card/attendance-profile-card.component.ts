import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../core/services/language.service';
import { ButtonComponent } from '../../../../../components/shared/button/button';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-attendance-profile-card',
  templateUrl: './attendance-profile-card.component.html',
  styleUrls: ['./attendance-profile-card.component.scss'],
  imports: [CommonModule, ButtonComponent, TranslateModule],
  standalone: true,
})
export class AttendanceProfileCardComponent implements OnInit, OnDestroy {
  @Input() data: any;

  modalOpen = false;
  private destroy$ = new Subject<void>();

  constructor(
    public language: LanguageService,
    private translate: TranslateService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.cd.markForCheck(); // Trigger change detection
    });
  }

  roles: any = {
    Marshall: 'MARSHALL',
    Supervisor: 'SUPERVISOR',
    'Senior Supervisor': 'SENIOR_SUPERVISOR',
    'Super Admin': 'SUPER_ADMIN',
    'Main User': 'MAIN_USER',
    'System Admin': 'SYSTEM_ADMIN',
  };

  getRole() {
    return this.roles[this.data.role];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openModal(evt?: MouseEvent) {
    evt?.stopPropagation();
    this.modalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.modalOpen = false;
    document.body.style.overflow = '';
  }

  handleModalEdit = (payload: any) => {
    this.data = { ...this.data, ...payload };
    console.log('User updated:', this.data);
    this.closeModal();
  };

  get displayName(): string {
    if (!this.data) return '';
    const name = this.data.name;
    if (!name) return '';
    if (typeof name === 'string') return name;

    const lang =
      (this.language.currentLang as string) ||
      (document.documentElement.dir === 'rtl' ? 'ar' : 'en');
    return name[lang] || name['en'] || Object.values(name)[0] || '';
  }
}
