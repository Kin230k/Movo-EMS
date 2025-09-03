// src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  UserCredential,
  sendEmailVerification,
} from '@angular/fire/auth';
import { auth as Auth } from '../../../main';

import { BehaviorSubject, Observable } from 'rxjs';
import { ApiQueriesService } from '../../core/services/queries.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = Auth;

  // Local BehaviorSubject to track current user
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$: Observable<User | null> =
    this.currentUserSubject.asObservable();

  constructor(private apiQueries: ApiQueriesService) {
    // Keep track of Firebase auth state
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
    });
  }

  /** Register a new user with email + password */
  async register(
    email: string,
    password: string,
    name: { en: string; ar: string },
    picture: string
  ): Promise<UserCredential> {
    let userCredential: UserCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
    } catch (error) {
      throw error;
    }

    try {
      const results = await this.apiQueries.registerUserMutation().mutateAsync({
        name,
        picture,
      });
      if (!results.success) {
        throw results.issues;
      }
    } catch (error) {
      throw error;
    }
    try {
      await sendEmailVerification(userCredential.user);
    } catch (error) {
      throw error;
    }

    return userCredential;
  }

  /**
   * Create a client account:
   * - create Firebase auth user (email + password)
   * - persist client record via API (createClientMutation)
   * - send email verification
   *
   * payload must include contactEmail and password (password will NOT be sent to the API)
   */
  async createClient(payload: {
    name: { en: string; ar: string };
    contactEmail: string;
    contactPhone: string;
    company: { en: string; ar: string };
    logo?: string;
    password: string;
  }): Promise<UserCredential> {
    if (!payload?.contactEmail) {
      throw new Error('contactEmail is required to create auth user');
    }
    if (!payload?.password) {
      throw new Error('password is required to create auth user');
    }

    let userCredential: UserCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(
        this.auth,
        payload.contactEmail,
        payload.password
      );
    } catch (err) {
      // creation of auth user failed
      throw err;
    }

    // Call API to create client record (do NOT send password to API)
    try {
      // remove password before sending to API
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...clientData } = payload as any;

      // adjust this API call name/shape if your apiQueries uses a different mutation
      const results = await this.apiQueries
        .createClientMutation()
        .mutateAsync(clientData);

      if (!results || !results.success) {
        // API rejected — attempt to rollback the created auth user to avoid orphaned users
        try {
          await userCredential.user.delete();
        } catch (rollbackErr) {
          console.warn(
            'Failed to rollback auth user after API failure',
            rollbackErr
          );
        }

        // Surface API error (attempt to prefer structured issues if present)
        throw (
          results?.issues ?? new Error('createClient API returned an error')
        );
      }
    } catch (apiErr) {
      // Rethrow (user was already deleted above on API failure)
      throw apiErr;
    }

    // send verification email (best-effort; if it fails we just log and still return credential)
    try {
      await sendEmailVerification(userCredential.user);
    } catch (mailErr) {
      console.warn('Failed to send verification email:', mailErr);
    }

    return userCredential;
  }

  /** Login with email + password */
  async login(email: string, password: string): Promise<UserCredential> {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  /** Logout the current user */
  async logout(): Promise<void> {
    return await signOut(this.auth);
  }

  /** Get current user snapshot (not observable) */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
}
