import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../core/services/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="lang-switcher">
      <label for="lang-select" class="sr-only">{{
        'COMMON.LANGUAGE' | translate : { default: 'Language' }
      }}</label>
      <select
        id="lang-select"
        class="lang-select"
        [value]="current()"
        (change)="onChange($event)"
      >
        <option value="en">EN</option>
        <option value="ar">AR</option>
      </select>
    </div>
  `,
  styles: [
    `
      .lang-switcher {
        display: inline-flex;
        align-items: center;
      }
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      .lang-select {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
        border: 1px solid var(--color-border, #ccc);
        color: var(--color-font-primary);
        cursor: pointer;
        background: transparent;
      }
    `,
  ],
})
export class LanguageSwitcherComponent {
  current = signal<'en' | 'ar'>('en');

  constructor(private language: LanguageService) {
    this.current.set(this.language.currentLang);
  }

  onChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as 'en' | 'ar';
    this.language.use(value);
    this.current.set(value);
  }
}
