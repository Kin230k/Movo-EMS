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
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { rolesBinding } from '../../../../../shared/types/roles';

@Component({
  selector: 'app-attendance-profile-card',
  templateUrl: './attendance-profile-card.component.html',
  styleUrls: ['./attendance-profile-card.component.scss'],
  imports: [CommonModule, TranslateModule],
  standalone: true,
})
export class AttendanceProfileCardComponent implements OnInit, OnDestroy {
  @Input() data!: {
    userId: number;
    name: {
      en: string;
      ar: string;
    };
    role: string;
    picture: string;
    isPresent: boolean;
    attendanceTimestamp: Date;
  };

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
  get displayDate() {
    const locale = this.translate.currentLang || 'en';
    return this.data.attendanceTimestamp.toLocaleString(locale, {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
