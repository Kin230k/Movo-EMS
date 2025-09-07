import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../core/services/language.service';
import { EditClientModalComponent } from './edit-client-modal.component';

@Component({
  selector: 'app-client-profile-card',
  standalone: true,
  templateUrl: './client-profile-card.component.html',
  styleUrls: ['./client-profile-card.component.scss'],
  imports: [CommonModule, TranslateModule, EditClientModalComponent],
})
export class ClientProfileCardComponent implements OnInit, OnDestroy {
  @Input() data: any;
  @Output() refetch = new EventEmitter<void>();

  modalOpen = false;
  isMenuOpen = false;

  @ViewChild('menuWrapper') menuWrapper!: ElementRef;

  constructor(
    private cd: ChangeDetectorRef,
    public language: LanguageService
  ) {}

  ngOnInit(): void {}
  ngOnDestroy(): void {}

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

  get companyName(): string {
    const company = this.data?.company;
    if (!company) return '';
    if (typeof company === 'string') return company;
    const lang =
      (this.language.currentLang as string) ||
      (document.documentElement.dir === 'rtl' ? 'ar' : 'en');
    return company[lang] || company['en'] || Object.values(company)[0] || '';
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

  toggleMenu(evt?: MouseEvent) {
    evt?.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
    this.cd.detectChanges();
  }

  handleModalEdit = (payload: any) => {
    this.data = { ...this.data, ...payload };
    this.closeModal();
  };

  handleModalRefetch = () => {
    this.refetch.emit();
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
