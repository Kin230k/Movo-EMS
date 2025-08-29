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

export interface EmailData {
  emailId: string;
  title: { en: string; ar: string };
  body: { en: string; ar: string };
  formId: string;
  formTitle?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-email-card',
  templateUrl: './email-card.component.html',
  styleUrls: ['./email-card.component.scss'],
  imports: [CommonModule, TranslateModule],
  standalone: true,
})
export class EmailCardComponent implements OnInit, OnDestroy {
  @Input() data: EmailData | null = null;

  modalOpen = false;
  isMenuOpen = false;
  private destroy$ = new Subject<void>();

  @ViewChild('menuWrapper') menuWrapper!: ElementRef;

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get displayTitle(): string {
    if (!this.data) return '';
    const title = this.data.title;
    if (!title) return '';
    if (typeof title === 'string') return title;

    const lang = this.language.currentLang;

    // Type-safe access to multilingual content
    if (lang === 'en' && title.en) return title.en;
    if (lang === 'ar' && title.ar) return title.ar;
    if (title.en) return title.en;
    if (title.ar) return title.ar;
    return Object.values(title)[0] || '';
  }

  get displayBody(): string {
    if (!this.data) return '';
    const body = this.data.body;
    if (!body) return '';
    if (typeof body === 'string') return body;

    const lang = this.language.currentLang;
    let fullBody = '';

    // Type-safe access to multilingual content
    if (lang === 'en' && body.en) fullBody = body.en;
    else if (lang === 'ar' && body.ar) fullBody = body.ar;
    else if (body.en) fullBody = body.en;
    else if (body.ar) fullBody = body.ar;
    else fullBody = Object.values(body)[0] || '';

    // Truncate long body text for display
    return fullBody.length > 150
      ? fullBody.substring(0, 150) + '...'
      : fullBody;
  }

  get emailTitle(): string {
    if (!this.data) return '';
    return `${this.translate.instant(
      'EMAILS.EMAIL'
    )} #${this.data.emailId.substring(0, 8)}`;
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

  onEditEmail(evt?: MouseEvent) {
    evt?.stopPropagation();
    console.log('Edit email', this.data);
  }

  onDeleteEmail(evt?: MouseEvent) {
    evt?.stopPropagation();
    console.log('Delete email', this.data);
  }

  onDuplicateEmail(evt?: MouseEvent) {
    evt?.stopPropagation();
    console.log('Duplicate email', this.data);
  }

  handleModalEdit = (payload: any) => {
    this.data = { ...this.data!, ...payload };
    console.log('Email updated:', this.data);
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
