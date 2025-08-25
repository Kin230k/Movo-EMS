import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { InputComponent } from '../../components/shared/input/input';
import { ThemedButtonComponent } from '../../components/shared/themed-button/themed-button';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service'; // <-- centralized service

@Component({
  selector: 'app-login-user',
  standalone: true,
  imports: [InputComponent, ThemedButtonComponent, TranslateModule],
  templateUrl: './login-user.html',
  styleUrls: ['./login-user.scss'],
})
export class LoginUser {
  email: string = '';
  password: string = '';

  constructor(private router: Router, private langService: LanguageService) {}

  // Optional: switch language from this page
  switchLanguage(lang: 'en' | 'ar') {
    this.langService.use(lang);
  }

  onLogin() {
    console.log('User login attempted with:', this.email, this.password);
  }

  onEmailChange(value: string) {
    this.email = value;
  }

  onPasswordChange(value: string) {
    this.password = value;
  }

  goToAdminLogin() {
    this.router.navigate(['/login/admin']);
  }
  
goToForgetPassword() {
  this.router.navigate(['/forget-password']);
}
}
