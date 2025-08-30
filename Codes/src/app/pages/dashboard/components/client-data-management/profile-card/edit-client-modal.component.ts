import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ImageUploadService } from '../../../../../core/services/image-upload.service';

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

  // Image upload properties
  selectedFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;
  previewUrl: string | null = null;
  hasUploadError = false;

  constructor(
    private translate: TranslateService,
    private imageUploadService: ImageUploadService
  ) {}

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

    // Set preview URL if logo exists
    if (this.logo) {
      this.previewUrl = this.logo;
    }
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Clear previous errors
    this.errorMessage = '';
    this.hasUploadError = false;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = this.translate.instant(
        'CLIENT_DATA_MANAGEMENT.ERRORS.INVALID_FILE_TYPE'
      );
      this.hasUploadError = true;
      this.clearFileSelection();
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      this.errorMessage = this.translate.instant(
        'CLIENT_DATA_MANAGEMENT.ERRORS.FILE_TOO_LARGE'
      );
      this.hasUploadError = true;
      this.clearFileSelection();
      return;
    }

    this.selectedFile = file;

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.onerror = () => {
      this.errorMessage = this.translate.instant(
        'CLIENT_DATA_MANAGEMENT.ERRORS.FILE_READ_ERROR'
      );
      this.hasUploadError = true;
      this.clearFileSelection();
    };
    reader.readAsDataURL(file);
  }

  private clearFileSelection() {
    this.selectedFile = null;
    this.previewUrl = null;
    // Reset file input
    const fileInput = document.querySelector(
      '#edit-client-logo-input'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async uploadImage() {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    try {
      const upload$ = this.imageUploadService.uploadFile(
        this.selectedFile,
        `clients/${Date.now()}_${this.selectedFile.name}`
      );

      upload$.subscribe({
        next: (progress) => {
          this.uploadProgress = progress.progress;
          if (progress.downloadURL) {
            this.logo = progress.downloadURL;
            this.isUploading = false;
            this.selectedFile = null;
          }
        },
        error: (error) => {
          console.error('Upload error:', error);
          this.errorMessage = this.translate.instant(
            'CLIENT_DATA_MANAGEMENT.ERRORS.UPLOAD_FAILED'
          );
          this.hasUploadError = true;
          this.isUploading = false;
          this.uploadProgress = 0;
        },
      });
      console.log(upload$);
    } catch (error) {
      console.error('Upload error:', error);
      this.errorMessage = this.translate.instant(
        'CLIENT_DATA_MANAGEMENT.ERRORS.UPLOAD_FAILED'
      );
      this.hasUploadError = true;
      this.isUploading = false;
    }
  }

  removeImage() {
    this.logo = undefined;
    this.previewUrl = null;
    this.selectedFile = null;
    this.uploadProgress = 0;
    this.isUploading = false;
    this.hasUploadError = false;
    this.errorMessage = '';
  }
}
