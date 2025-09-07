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
  sendPasswordResetEmail,
} from '@angular/fire/auth';
import { auth as Auth } from '../../../main';

import { BehaviorSubject, Observable } from 'rxjs';
import api from '../../core/api/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = Auth;

  // Local BehaviorSubject to track current user
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$: Observable<User | null> =
    this.currentUserSubject.asObservable();

  constructor() {
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
      const result = await api.registerUser({
        name,
        picture,
      });
      // The API call succeeded if no exception was thrown
      console.log('User registered successfully:', result);
    } catch (error) {
      console.error('Failed to register user in API:', error);
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

      // Use direct API call
      const result = await api.createClient(clientData);

      // The API call succeeded if no exception was thrown
      console.log('Client created successfully:', result);
    } catch (apiErr) {
      // API rejected — attempt to rollback the created auth user to avoid orphaned users
      try {
        await userCredential.user.delete();
        console.log('Rolled back auth user after API failure');
      } catch (rollbackErr) {
        console.warn(
          'Failed to rollback auth user after API failure',
          rollbackErr
        );
      }

      // Rethrow the API error
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

  /** Send password reset email */
  async sendPasswordReset(email: string): Promise<void> {
    return await sendPasswordResetEmail(this.auth, email);
  }
}
