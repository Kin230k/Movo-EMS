// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginUser } from './pages/login-user/login-user';
import { LoginAdmin } from './pages/login-admin/login-admin';

export const routes: Routes = [
  { path: '', redirectTo: '/user-login', pathMatch: 'full' },
  { path: 'user-login', component:  LoginUser },
  { path: 'admin-login', component: LoginAdmin },
];   