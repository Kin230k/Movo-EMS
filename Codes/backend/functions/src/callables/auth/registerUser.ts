import { onCall } from 'firebase-functions/v2/https';
import { registerUserHandler } from '../../handlers/auth/registerUserHandler';

export const registerUser = onCall({ maxInstances: 10 }, registerUserHandler);
