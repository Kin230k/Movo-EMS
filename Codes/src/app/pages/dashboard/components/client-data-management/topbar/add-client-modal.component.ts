import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ImageUploadService } from '../../../../../core/services/image-upload.service';

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
    this.uploadImage();
  }

  private clearFileSelection() {
    this.selectedFile = null;
    this.previewUrl = null;
    // Reset file input
    const fileInput = document.querySelector(
      '#client-logo-input'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async uploadImage() {
    if (!this.selectedFile) return;
    console.log(this.selectedFile);

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
