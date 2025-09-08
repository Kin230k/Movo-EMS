import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InputComponent } from '../../components/shared/input/input';
import { ThemedButtonComponent } from '../../components/shared/themed-button/themed-button';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service'; // <-- centralized service
import { AuthService } from '../../core/services/auth.service';
import { IdentityService } from '../../core/services/identity.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login-user',
  standalone: true,
  imports: [InputComponent, ThemedButtonComponent, TranslateModule],
  templateUrl: './login-user.html',
  styleUrls: ['./login-user.scss'],
})
export class LoginUser implements OnInit {
  email: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private langService: LanguageService,
    private auth: AuthService,
    private identity: IdentityService,
    private toast: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    const who = await this.identity.getIdentity(true);
    if (who.isAdmin || who.isClient) {
      this.router.navigate(['/dashboard']);
    } else if (who.isWorker) {
      this.router.navigate(['/take-attendance']);
    } else if (who.isUser) {
      this.router.navigate(['/projects']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  // Optional: switch language from this page
  switchLanguage(lang: 'en' | 'ar') {
    this.langService.use(lang);
  }

  async onLogin() {
    try {
      await this.auth.login(this.email, this.password);
      const who = await this.identity.getIdentity(true);
      if (who.isAdmin || who.isClient) {
        this.router.navigate(['/dashboard']);
      } else if (who.isWorker) {
        this.router.navigate(['/take-attendance']);
      } else if (who.isUser) {
        this.router.navigate(['/projects']);
      } else {
        this.router.navigate(['/login']);
      }
    } catch (err) {
      console.error('Login failed:', err);
      this.toast.error('Login failed. Please check your credentials.');
    }
  }

  onEmailChange(value: string) {
    this.email = value;
  }

  onPasswordChange(value: string) {
    this.password = value;
  } 

  goToForgetPassword() {
    this.router.navigate(['/forget-password']);
  }
  goToSignUp() {
    this.router.navigate(['/signup']);
  }
}
