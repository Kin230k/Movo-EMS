import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core'; // Import TranslateService and TranslateModule
import { LanguageService } from '../../../../../core/services/language.service'; // Import your LanguageService
import { ButtonComponent } from '../../../../../components/shared/button/button';
import { ProfileModalComponent } from './profile-modal/profile-modal.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss'],
  imports: [
    CommonModule,
    ButtonComponent,
    ProfileModalComponent,
    TranslateModule, // <-- Import TranslateModule here for translation pipe
  ],
  standalone: true,
})
export class ProfileCardComponent implements OnInit, OnDestroy {
  @Input() data: any;

  modalOpen = false;
  private destroy$ = new Subject<void>();

  constructor(
    public language: LanguageService, // Language service injected for dynamic language switching
    private translate: TranslateService, // Injected to handle translations
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Ensure UI updates when language is changed at runtime
    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.cd.markForCheck();
    });
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
  openMobileMenu(evt?: MouseEvent) {}
  closeModal() {
    this.modalOpen = false;
    document.body.style.overflow = '';
  }

  onDisableUser(evt?: MouseEvent) {
    evt?.stopPropagation();
    console.log('Disable user', this.data);
  }

  onEditUser(evt?: MouseEvent) {
    evt?.stopPropagation();
    console.log('Edit user', this.data);
  }

  handleModalEdit = (payload: any) => {
    this.data = { ...this.data, ...payload };
    console.log('User updated:', this.data);
    this.closeModal();
  };

  handleModalDisable = (payload: any) => {
    this.onDisableUser();
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
