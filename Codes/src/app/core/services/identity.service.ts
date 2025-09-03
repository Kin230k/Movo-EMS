import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import * as api from '../api/api';

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
  private identitySubject = new BehaviorSubject<CallerIdentity | null>(null);
  identity$ = this.identitySubject.asObservable();
  private loadingPromise: Promise<CallerIdentity> | null = null;

  private withTimeout<T>(promise: Promise<T>, ms = 3000): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('identity-timeout')), ms);
      promise
        .then((val) => {
          clearTimeout(timer);
          resolve(val);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  async getIdentity(forceRefresh = false): Promise<CallerIdentity> {
    const cached = this.identitySubject.getValue();
    console.log('getIdentity', forceRefresh);
    console.log('cached', cached);
    if (cached && !forceRefresh) return cached;

    if (!this.loadingPromise) {
      this.loadingPromise = (async () => {
        try {
          const result: any = await this.withTimeout(
            api.getCallerIdentity(),
            3000
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
        } catch (_err) {
          // treat as unauth/unknown
          this.identitySubject.next(null);
          throw _err;
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
