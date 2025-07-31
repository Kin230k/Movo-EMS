import { onCall } from 'firebase-functions/v2/https';
import { loginHandler } from '../../handlers/loginHandlers';

export const login = onCall({ maxInstances: 10 }, loginHandler);
