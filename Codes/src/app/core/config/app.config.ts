import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from '../../app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';

import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import {
  provideTanStackQuery,
  QueryClient,
  withDevtools,
} from '@tanstack/angular-query-experimental';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { initializeApp } from 'firebase/app';
import { provideFirebaseApp } from '@angular/fire/app';
import { firebaseConfig } from '../../../environments/firebase.config';
// Global error handler
class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    console.error('Global error caught:', error);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideRouter(routes),
    provideClientHydration(withEventReplay()),

    provideHttpClient(withInterceptorsFromDi()),
    provideTanStackQuery(
      new QueryClient({
        defaultOptions: {
          queries: {
            // Treat fresh for 5 minutes by default
            staleTime: 5 * 60 * 1000,
            // Reasonable cache GC window
            gcTime: 15 * 60 * 1000,
            // Avoid refetching on every focus which can flicker to stale
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            refetchOnMount: false,
            retry: 2,
          },
        },
      }),
      withDevtools()
    ),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json',
      }),
      fallbackLang: 'en',
      lang: 'en',
    }),
  ],
};
