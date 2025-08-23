import { Routes } from '@angular/router';
import { LoginUser } from './pages/login/login-user';
import { LoginAdmin } from './pages/login/admin/login-admin';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginUser },
  { path: 'login/admin', component: LoginAdmin },

  // lazy-loaded dashboard module
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./pages/dashboard/dashboard.module').then(
        (m) => m.DashboardModule
      ),
  },

  // optional wildcard
  { path: '**', redirectTo: 'login' },
];
