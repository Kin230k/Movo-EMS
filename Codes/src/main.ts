import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/core/config/app.config.server';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './environments/firebase.config';
import { connectAuthEmulator } from '@angular/fire/auth';
import { getAuth } from '@angular/fire/auth';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import api from './app/core/api/api';
import { ToastService } from './app/core/services/toast.service';

let FUNCTIONS_REGION = 'us-central1';

const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const functions = getFunctions(app, FUNCTIONS_REGION);
if (typeof window !== 'undefined' && location.hostname === 'localhost') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}

bootstrapApplication(App, appConfig)
  .then((ref) => {
    const toast = ref.injector.get(ToastService);
    if (toast) {
      api.setApiToastService?.(toast);
    }
  })
  .catch((err) => console.error(err));
