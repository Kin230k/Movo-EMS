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
import { LanguageService } from '../../../../core/services/language.service';
import { ButtonComponent } from '../../../../components/shared/button/button';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface FormData {
  formId: string;
  projectId?: string;
  locationId?: string;
  projectName?: { en: string; ar: string };
  locationName?: { en: string; ar: string };
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-form-card',
  templateUrl: './form-card.component.html',
  styleUrls: ['./form-card.component.scss'],
  imports: [CommonModule, ButtonComponent, TranslateModule],
  standalone: true,
})
export class FormCardComponent implements OnInit, OnDestroy {
  @Input() data: FormData | null = null;

  modalOpen = false;
  isMenuOpen = false;
  private destroy$ = new Subject<void>();

  @ViewChild('menuWrapper') menuWrapper!: ElementRef;

  constructor(
    public language: LanguageService,
    private translate: TranslateService,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.cd.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get formType(): string {
    if (!this.data) return '';
    if (this.data.projectId) return 'PROJECT_BASED';
    if (this.data.locationId) return 'LOCATION_BASED';
    return 'UNKNOWN';
  }

  get relatedEntityName(): string {
    if (!this.data) return '';

    if (this.data.projectId && this.data.projectName) {
      const lang = this.language.currentLang;
      return this.data.projectName[lang] || this.data.projectName.en || '';
    }

    if (this.data.locationId && this.data.locationName) {
      const lang = this.language.currentLang;
      return this.data.locationName[lang] || this.data.locationName.en || '';
    }

    return '';
  }

  get formTitle(): string {
    if (!this.data) return '';
    return `${this.translate.instant(
      'FORM_MANAGEMENT.FORM'
    )} #${this.data.formId.substring(0, 8)}`;
  }

  openModal(evt?: MouseEvent) {
    evt?.stopPropagation();
    this.modalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  toggleMenu(evt?: MouseEvent) {
    evt?.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
    this.cd.detectChanges();
  }

  closeModal() {
    this.modalOpen = false;
    document.body.style.overflow = '';
  }

  onEditForm(evt?: MouseEvent) {
    evt?.stopPropagation();
    this.router.navigate(['/dashboard/create-form-questions'], {
      queryParams: {
        projectId: this.data?.projectId,
        locationId: this.data?.locationId,
      },
    });
  }

  onDeleteForm(evt?: MouseEvent) {
    evt?.stopPropagation();
    console.log('Delete form', this.data);
  }

  onDuplicateForm(evt?: MouseEvent) {
    evt?.stopPropagation();
    console.log('Duplicate form', this.data);
  }

  handleModalEdit = (payload: any) => {
    this.data = { ...this.data!, ...payload };
    console.log('Form updated:', this.data);
    this.closeModal();
  };

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
