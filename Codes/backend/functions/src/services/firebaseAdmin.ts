import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Set the env var BEFORE calling getAuth
if (process.env.FUNCTIONS_EMULATOR === 'true') {
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
}

// Initialize Admin SDK only once
if (!getApps().length) {
  if (process.env.FUNCTIONS_EMULATOR === 'true') {
    initializeApp({
      credential: applicationDefault(),
    });
    console.log('🔥 Firebase Admin using AUTH emulator');
  } else {
    initializeApp(); // Use default credentials in production
    console.log('🚀 Firebase Admin using production environment');
  }
}

// Export the auth instance
export const auth = getAuth();
