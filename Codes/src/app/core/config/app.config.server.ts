import { ApplicationConfig, PLATFORM_ID, inject } from '@angular/core';
import { provideQueryClient } from '@tanstack/angular-query-experimental';
import { QueryClient } from '@tanstack/query-core';
import { isPlatformBrowser } from '@angular/common';
import { persistQueryClient } from '@tanstack/query-persist-client-core';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// Your existing imports and config here...

const queryClientFactory = (platformId: Object) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        staleTime: 5 * 60 * 1000, // Example defaults; adjust as needed
        gcTime: Infinity, // Keep data indefinitely (persister handles eviction)
      },
    },
  });

  if (isPlatformBrowser(platformId)) {
    const persister = createSyncStoragePersister({
      storage: window.localStorage,
      key: 'my-app-query-cache', // Optional: Custom key to namespace storage
    });

    persistQueryClient({
      queryClient,
      persister,
      maxAge: 1000 * 60 * 60 * 24, // Persist for 24 hours; adjust as needed
    });
  }

  return queryClient;
};

export const appConfig: ApplicationConfig = {
  providers: [
    // Your existing providers here...
    {
      provide: QueryClient,
      useFactory: queryClientFactory,
      deps: [PLATFORM_ID],
    },
    provideQueryClient(inject(QueryClient)),
  ],
};
