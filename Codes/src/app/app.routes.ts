import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // login routes
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login-user').then((m) => m.LoginUser),
  },
  {
    path: 'login/admin',
    loadComponent: () =>
      import('./pages/login/admin/login-admin').then((m) => m.LoginAdmin),
  },

  // forgot password route
{
  path: 'forget-password',
  loadComponent: () =>
    import('./pages/login/forget-password/forget-password.component').then(
      (m) => m.ForgetPasswordComponent
    ),
},
  // dashboard (parent)
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'permissions-management' },

      // child routes for each feature
      {
        path: 'project-management',
        loadComponent: () =>
          import(
            './pages/dashboard/components/project-management/project-management.component'
          ).then((m) => m.ProjectManagementComponent),
      },
      {
        path: 'form-management',
        loadComponent: () =>
          import(
            './pages/dashboard/components/form-management/form-management.component'
          ).then((m) => m.FormManagementComponent),
      },
      {
        path: 'create-interview-questions',
        loadComponent: () =>
          import(
            './pages/dashboard/components/create-interview-questions/create-interview-questions.component'
          ).then((m) => m.CreateInterviewQuestionsComponent),
      },
      {
        path: 'location-management',
        loadComponent: () =>
          import(
            './pages/dashboard/components/location-management/location-management.component'
          ).then((m) => m.LocationManagementComponent),
      },
      {
        path: 'user-management',
        loadComponent: () =>
          import(
            './pages/dashboard/components/user-management/user-management.component'
          ).then((m) => m.UserManagementComponent),
      },
      {
        path: 'send-emails',
        loadComponent: () =>
          import(
            './pages/dashboard/components/send-emails/send-emails.component'
          ).then((m) => m.SendEmailsComponent),
      },
      {
        path: 'view-records',
        loadComponent: () =>
          import(
            './pages/dashboard/components/view-records/view-records.component'
          ).then((m) => m.ViewRecordsComponent),
      },
      {
        path: 'client-data-management',
        loadComponent: () =>
          import(
            './pages/dashboard/components/client-data-management/client-data-management.component'
          ).then((m) => m.ClientDataManagementComponent),
      },
      {
        path: 'permissions-management',
        loadComponent: () =>
          import(
            './pages/dashboard/components/permissions-management/permissions-management.component'
          ).then((m) => m.PermissionsManagementComponent),
      },
      {
        path: 'attendance-management',
        loadComponent: () =>
          import(
            './pages/dashboard/components/attendance-management/attendance-management.component'
          ).then((m) => m.AttendanceManagementComponent),
      },
    ],
  },

  // fallback
  { path: '**', redirectTo: 'login' },
];
