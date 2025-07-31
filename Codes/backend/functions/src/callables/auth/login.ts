import { onCall } from 'firebase-functions/v2/https';
import { loginHandler } from '../../handlers/auth/loginHandlers';

export const login = onCall({ maxInstances: 10 }, loginHandler);
