import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/core/config/app.config';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './environments/firebase.config';

initializeApp(firebaseConfig);

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
