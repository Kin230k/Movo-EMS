import { onCall } from 'firebase-functions/v2/https';
import { registerUserHandler } from '../../handlers/registerUserHandler';

export const registerUser = onCall({ maxInstances: 10 }, registerUserHandler);
