import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/core/config/app.config.server';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './environments/firebase.config';
import { connectAuthEmulator } from '@angular/fire/auth';
import { getAuth } from '@angular/fire/auth';

initializeApp(firebaseConfig);
const auth = getAuth();
if (typeof window !== 'undefined' && location.hostname === 'localhost') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
}

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
