import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // login routes (example — keep yours)
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

  // dashboard (parent)
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'user-management' },

      // child routes for each feature you listed
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
        path: 'create-questions',
        loadComponent: () =>
          import(
            './pages/dashboard/components/form-questions/form-questions.component'
          ).then((m) => m.FormQuestionsComponent),
      },
      {
        path: 'interview',
        loadComponent: () =>
          import(
            './pages/dashboard/components/interview/interview.component'
          ).then((m) => m.InterviewerFormPageComponent),
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
          import('./pages/dashboard/components/emails/emails.component').then(
            (m) => m.EmailsComponent
          ),
      },
      {
        path: 'view-submissions',
        loadComponent: () =>
          import(
            './pages/dashboard/components/view-submissions/view-submissions.component'
          ).then((m) => m.ViewSubmissionsComponent),
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
  {
    path: 'form/:formId',
    loadComponent: () =>
      import('./pages/form/form-page.component').then(
        (m) => m.FormPageComponent
      ),
  },
  {
    path: 'interviews/:interviewId',
    loadComponent: () =>
      import('./pages/interview/interview-questions-page.component').then(
        (m) => m.InterviewQuestionsPageComponent
      ),
  },
  { path: '**', redirectTo: 'login' },
];
