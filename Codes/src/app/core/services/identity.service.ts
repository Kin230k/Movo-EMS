import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, firstValueFrom, from, timer, throwError } from 'rxjs';
import { catchError, retryWhen, scan, concatMap } from 'rxjs/operators';
import * as api from '../api/api';
import { AuthService } from './auth.service';

export type CallerIdentity = {
  isAdmin: boolean;
  isClient: boolean;
  isUser: boolean;
  isWorker: boolean;
  isCaller: boolean;
  role?: string | null;
};

@Injectable({ providedIn: 'root' })
export class IdentityService {
  private authService = inject(AuthService);
  private identitySubject = new BehaviorSubject<CallerIdentity | null>(null);
  identity$ = this.identitySubject.asObservable();
  private loadingPromise: Promise<CallerIdentity> | null = null;

  /**
   * Fetch caller identity. If the request is slow, this will retry with
   * exponential backoff (so callers wait until we either succeed or exhaust retries).
   *
   * If you truly want to wait forever until the server recovers, set maxRetries to Infinity
   * (not recommended in production). The defaults here try for a reasonable amount of time.
   */
  async getIdentity(forceRefresh = false): Promise<CallerIdentity> {
    const cached = this.identitySubject.getValue();
    if (cached && !forceRefresh) return cached;

    if (!this.loadingPromise) {
      this.loadingPromise = (async () => {
        try {
          // First check if user is authenticated in Firebase
          const firebaseUser = this.authService.getCurrentUser();

          // If not authenticated in Firebase, return all flags as false
          if (!firebaseUser) {
            const defaultIdentity: CallerIdentity = {
              isAdmin: false,
              isClient: false,
              isUser: false,
              isWorker: false,
              isCaller: false,
              role: null,
            };
            this.identitySubject.next(defaultIdentity);
            return defaultIdentity;
          }

          // User is authenticated in Firebase, proceed with API call
          // Configuration (tweak as needed)
          const maxRetries = 6; // total attempts = 1 initial + up to 6 retries
          const baseDelayMs = 1000; // initial backoff (1s), then 2s, 4s, ...

          const result: any = await firstValueFrom(
            from(api.getCallerIdentity()).pipe(
              // Retry with exponential backoff up to maxRetries.
              retryWhen((errors) =>
                errors.pipe(
                  // count retries
                  scan((retryCount, err) => {
                    const nextCount = retryCount + 1;
                    if (nextCount > maxRetries) {
                      // rethrow to terminate retries
                      throw err;
                    }
                    return nextCount;
                  }, 0),
                  // wait before next retry: baseDelayMs * 2^(retryCount-1)
                  concatMap((retryCount) =>
                    timer(
                      Math.min(baseDelayMs * Math.pow(2, retryCount - 1), 15000)
                    )
                  )
                )
              ),
              // Final mapping of any error into a thrown error for firstValueFrom to catch.
              catchError((err) => {
                return throwError(() => err);
              })
            )
          );

          const normalized: CallerIdentity = {
            isAdmin: !!result?.isAdmin,
            isClient: !!result?.isClient,
            isUser: !!result?.isUser,
            isWorker: !!(result?.isUserWorker ?? result?.isWorker),
            isCaller: !!result?.isCaller,
            role: result?.role ?? null,
          };

          this.identitySubject.next(normalized);
          return normalized;
        } catch (err) {
          // treat as unauth/unknown on error
          this.identitySubject.next(null);
          throw err;
        } finally {
          this.loadingPromise = null;
        }
      })();
    }

    return this.loadingPromise;
  }

  resetIdentity(): void {
    this.identitySubject.next(null);
    this.loadingPromise = null;
  }
}
