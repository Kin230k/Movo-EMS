// src/app/core/services/language.service.ts
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly availableLangs = ['en', 'ar'];

  constructor(private translate: TranslateService) {
    // Initialize once
    this.translate.addLangs(this.availableLangs);
    this.translate.setFallbackLang('en');

    // Detect browser language or default to English
    const browserLang = this.translate.getBrowserLang();
    this.use(browserLang === 'ar' ? 'ar' : 'en');
  }
  setLanguage(lang: string) {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang; // good practice
  }
  use(lang: 'en' | 'ar') {
    this.translate.use(lang);
    this.setLanguage(lang);
  }

  get currentLang() {
    return this.translate.getCurrentLang() as 'en' | 'ar';
  }
}
