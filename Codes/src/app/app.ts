import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastComponent } from './components/shared/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslateModule, ToastComponent],
  template: `
    <router-outlet></router-outlet>
    <app-toast></app-toast>
  `,
})
export class App {
  protected title = 'movo-project';

  constructor(private translate: TranslateService) {
    // Register supported languages
    this.translate.addLangs(['en', 'ar']);

    // Set fallback language
    this.translate.setFallbackLang('en');

    // Set initial active language
    this.translate.use('en');
  }
}
