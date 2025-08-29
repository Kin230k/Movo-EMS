import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-add-client-modal',
  standalone: true,
  templateUrl: './add-client-modal.component.html',
  styleUrls: ['./add-client-modal.component.scss'],
  imports: [CommonModule, FormsModule, TranslateModule],
})
export class AddClientModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() clientCreated = new EventEmitter<{
    name: { en: string; ar: string };
    contactEmail: string;
    contactPhone: string;
    password: string;
    logo?: string;
    company?: { en: string; ar: string } | null;
  }>();

  nameEn = '';
  nameAr = '';
  companyEn = '';
  companyAr = '';
  contactEmail = '';
  contactPhone = '';
  password = '';
  logo: string | undefined = undefined;

  errorMessage = '';

  constructor(private translate: TranslateService) {}

  onClose() {
    this.close.emit();
  }

  onSave() {
    if (!this.nameEn.trim() || !this.nameAr.trim()) {
      this.errorMessage = this.translate.instant(
        'CLIENT_DATA_MANAGEMENT.ERRORS.NAME_REQUIRED'
      );
      return;
    }
    if (!this.contactEmail.trim()) {
      this.errorMessage = this.translate.instant(
        'CLIENT_DATA_MANAGEMENT.ERRORS.EMAIL_REQUIRED'
      );
      return;
    }
    if (!this.contactPhone.trim()) {
      this.errorMessage = this.translate.instant(
        'CLIENT_DATA_MANAGEMENT.ERRORS.PHONE_REQUIRED'
      );
      return;
    }
    if (!this.password.trim()) {
      this.errorMessage = this.translate.instant(
        'CLIENT_DATA_MANAGEMENT.ERRORS.PASSWORD_REQUIRED'
      );
      return;
    }

    this.clientCreated.emit({
      name: { en: this.nameEn.trim(), ar: this.nameAr.trim() },
      contactEmail: this.contactEmail.trim(),
      contactPhone: this.contactPhone.trim(),
      password: this.password,
      logo: this.logo,
      company:
        this.companyEn.trim() || this.companyAr.trim()
          ? { en: this.companyEn.trim(), ar: this.companyAr.trim() }
          : null,
    });
  }
}
