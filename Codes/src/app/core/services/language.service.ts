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

  use(lang: 'en' | 'ar') {
    this.translate.use(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  get currentLang() {
    return this.translate.currentLang;
  }
}
