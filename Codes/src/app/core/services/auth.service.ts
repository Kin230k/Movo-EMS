// src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  UserCredential,
  getAuth,
} from '@angular/fire/auth';

import { BehaviorSubject, Observable } from 'rxjs';
import { ApiQueriesService } from '../../core/services/queries.service';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = getAuth();

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

    // try {
    //   const { results } = await this.apiQueries
    //     .registerUserMutation()
    //     .mutateAsync({
    //       name,
    //       picture,
    //     });
    //   if (!results.success) {
    //     throw results.issues;
    //   }
    // } catch (error) {
    //   throw error;
    // }
    // registerUser mutation api call

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
