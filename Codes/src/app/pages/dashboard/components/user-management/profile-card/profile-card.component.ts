import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../core/services/language.service';
import { ButtonComponent } from '../../../../../components/shared/button/button';
import { ProfileModalComponent } from './profile-modal/profile-modal.component';
import { DeleteModalComponent } from '../../../../../components/shared/delete-modal/delete-modal.component';
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
    DeleteModalComponent,
    TranslateModule,
  ],
  standalone: true,
})
export class ProfileCardComponent implements OnInit, OnDestroy {
  @Input() data: any;

  modalOpen = false;
  deleteModalOpen = false;
  isMenuOpen = false; // To toggle the visibility of the menu
  private destroy$ = new Subject<void>();

  @ViewChild('menuWrapper') menuWrapper!: ElementRef;

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

  toggleMenu(evt?: MouseEvent) {
    evt?.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen; // Toggle state to show/hide menu
    this.cd.detectChanges(); // Manually trigger change detection if needed
  }

  closeModal() {
    this.modalOpen = false;
    document.body.style.overflow = '';
  }

  onDisableUser(evt?: MouseEvent) {
    evt?.stopPropagation();
    // open delete confirmation modal instead of immediate disable
    this.deleteModalOpen = true;
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

  closeDeleteModal() {
    this.deleteModalOpen = false;
  }

  confirmDisable() {
    // emit or call disable logic here
    console.log('Confirmed disable for', this.data);
    this.deleteModalOpen = false;
    this.closeModal();
  }

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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (
      this.isMenuOpen &&
      this.menuWrapper &&
      !this.menuWrapper.nativeElement.contains(event.target)
    ) {
      this.isMenuOpen = false;
      this.cd.detectChanges();
    }
  }
}
