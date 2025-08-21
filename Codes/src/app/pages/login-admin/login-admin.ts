// src/app/pages/login-admin/login-admin.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { InputComponent } from '../../components/shared/input/input';
import { ButtonComponent } from '../../components/shared/button/button';

@Component({
  selector: 'app-login-admin',
  standalone: true,
  imports: [InputComponent, ButtonComponent],
  templateUrl: './login-admin.html',
  styleUrl: './login-admin.scss'
})
export class LoginAdmin {
  email: string = '';
  password: string = '';

  constructor(private router: Router) {}

  onLogin() {
    console.log('Admin login attempted with:', this.email, this.password);
  }

  onEmailChange(value: string) {
    this.email = value;
  }

  onPasswordChange(value: string) {
    this.password = value;
  }

  goToUserLogin() {
    this.router.navigate(['/user-login']);
  }
}