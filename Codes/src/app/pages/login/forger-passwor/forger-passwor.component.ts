import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { ThemedButtonComponent } from '../../../components/shared/themed-button/themed-button';
import { InputComponent } from '../../../components/shared/input/input';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [InputComponent, ThemedButtonComponent, TranslateModule],
  templateUrl: './forger-passwor.component.html',
  styleUrls: ['./forger-passwor.component.scss'],
})
export class ForgetPasswordComponent {
  email: string = '';

  constructor(private router: Router) {}

  onEmailChange(value: string) {
    this.email = value;
  }

  onResetPassword() {
    console.log('Password reset requested for:', this.email);
    // هنا سيتم إضافة منطق إعادة تعيين كلمة المرور
   
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}