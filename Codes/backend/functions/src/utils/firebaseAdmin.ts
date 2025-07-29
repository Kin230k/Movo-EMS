// src/utils/firebaseAdmin.ts
import { initializeApp, getApps } from 'firebase-admin/app';

// Only initialize the default app once
if (!getApps().length) {
  initializeApp();
}
