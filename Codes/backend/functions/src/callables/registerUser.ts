import * as functions from 'firebase-functions';
import { registerUserHandler } from '../handlers/registerUserHandler';

export const registerUser = functions.https.onCall(registerUserHandler);
