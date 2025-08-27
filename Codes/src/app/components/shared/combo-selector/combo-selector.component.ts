import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-combo-selector',
  templateUrl: './combo-selector.component.html',
  styleUrls: ['./combo-selector.component.scss'],
  imports: [CommonModule, FormsModule, TranslateModule],
  standalone: true,
})
export class ComboSelectorComponent {
  @Input() projects: { id: any; name: {en: string; ar: string} }[] = [];
  @Output() projectSelected = new EventEmitter<any>();
  @Input() placeholder: string = '';
  constructor(private translate: LanguageService) {}

  get currentLang(): 'en' | 'ar' {
    return this.translate.currentLang;
  }

  onSelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    if (value) {
      this.projectSelected.emit(value);
    }
  }
}
