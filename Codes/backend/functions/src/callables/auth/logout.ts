import { onCall } from 'firebase-functions/v2/https';
import { logoutHandler } from '../../handlers/auth/logoutHandlers';

export const logout = onCall({ maxInstances: 10 }, logoutHandler);
