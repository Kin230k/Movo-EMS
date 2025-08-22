// src/app/pages/login-user/login-user.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { InputComponent } from '../../components/shared/input/input';
import { ButtonComponent } from '../../components/shared/button/button';

@Component({
    selector: 'app-login-user',
    imports: [InputComponent, ButtonComponent],
    templateUrl: './login-user.html',
    styleUrl: './login-user.scss'
})
export class LoginUser {
  email: string = '';
  password: string = '';

  constructor(private router: Router) {}

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
    this.router.navigate(['/admin-login']);
  }
}