// src/app/core/config/app.config.server.ts
import { ApplicationConfig, InjectionToken, PLATFORM_ID } from '@angular/core';
import {
  provideQueryClient,
  provideTanStackQuery,
  withDevtools,
} from '@tanstack/angular-query-experimental';
import { QueryClient } from '@tanstack/query-core';
import { isPlatformBrowser } from '@angular/common';
import { persistQueryClient } from '@tanstack/query-persist-client-core';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { firebaseConfig } from '../../../environments/firebase.config';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from '../../app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';

// Injection token to register QueryClient into DI
export const QUERY_CLIENT = new InjectionToken<QueryClient>('APP_QUERY_CLIENT');

const queryClientFactory = (platformId: Object) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        staleTime: 5 * 60 * 1000,
        gcTime: Infinity,
      },
    },
  });

  if (isPlatformBrowser(platformId)) {
    const persister = createSyncStoragePersister({
      storage: window.localStorage,
      key: 'my-app-query-cache',
    });

    persistQueryClient({
      queryClient,
      persister,
      maxAge: 60 * 2,
    });
  }

  return queryClient;
};

export const appConfig: ApplicationConfig = {
  providers: [
    // Router and hydration
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    // Provide the QueryClient instance under an InjectionToken using a factory
    {
      provide: QUERY_CLIENT,
      useFactory: queryClientFactory,
      deps: [PLATFORM_ID],
    },

    // Tell @tanstack/angular-query to use the QueryClient from DI (the token above)
    provideQueryClient(QUERY_CLIENT),
    // show tanstack devtools
    provideTanStackQuery(QUERY_CLIENT, withDevtools()),

    // Firebase providers (modular @angular/fire)
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),

    // ...other global providers
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json',
      }),
      fallbackLang: 'en',
      lang: 'en',
    }),
    provideHttpClient(withInterceptorsFromDi()),
  ],
};
