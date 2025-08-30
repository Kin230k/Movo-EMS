// src/app/pages/login-admin/login-admin.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { InputComponent } from '../../../components/shared/input/input';
import { ThemedButtonComponent } from '../../../components/shared/themed-button/themed-button';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login-admin',
  standalone: true,
  imports: [InputComponent, ThemedButtonComponent, TranslateModule],
  templateUrl: './login-admin.html',
  styleUrls: ['./login-admin.scss'],
})
export class LoginAdmin {
  email: string = '';
  password: string = '';

  constructor(private router: Router, private translate: TranslateService) {}

  switchLanguage(lang: 'en' | 'ar') {
    this.translate.use(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  onLogin() {
    console.log('Admin login attempted with:', this.email, this.password);
    // TODO: add real login logic
  }

  onEmailChange(value: string) {
    this.email = value;
  }

  onPasswordChange(value: string) {
    this.password = value;
  }

  goToUserLogin() {
    this.router.navigate(['/login']);
  }
  goToForgetPassword() {
    this.router.navigate(['/forget-password']);
  }
}
