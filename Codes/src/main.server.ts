import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/core/config/app.config.server';

const bootstrap = () => bootstrapApplication(App, appConfig);

export default bootstrap;
