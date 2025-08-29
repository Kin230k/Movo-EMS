import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-edit-client-modal',
  standalone: true,
  templateUrl: './edit-client-modal.component.html',
  styleUrls: ['./edit-client-modal.component.scss'],
  imports: [CommonModule, FormsModule, TranslateModule],
})
export class EditClientModalComponent {
  @Input() data: any;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  nameEn = '';
  nameAr = '';
  companyEn = '';
  companyAr = '';
  contactEmail = '';
  contactPhone = '';
  logo: string | undefined = undefined;

  errorMessage = '';

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    const name = this.data?.name || {};
    const company = this.data?.company || null;
    this.nameEn = typeof name === 'string' ? name : name.en || '';
    this.nameAr = typeof name === 'string' ? name : name.ar || '';
    this.companyEn = company
      ? typeof company === 'string'
        ? company
        : company.en || ''
      : '';
    this.companyAr = company
      ? typeof company === 'string'
        ? company
        : company.ar || ''
      : '';
    this.contactEmail = this.data?.email || this.data?.contactEmail || '';
    this.contactPhone = this.data?.phone || this.data?.contactPhone || '';
    this.logo = this.data?.logo || this.data?.picture || '';
  }

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

    this.save.emit({
      name: { en: this.nameEn.trim(), ar: this.nameAr.trim() },
      contactEmail: this.contactEmail.trim(),
      contactPhone: this.contactPhone.trim(),
      logo: this.logo,
      company:
        this.companyEn.trim() || this.companyAr.trim()
          ? { en: this.companyEn.trim(), ar: this.companyAr.trim() }
          : null,
    });
  }
}
