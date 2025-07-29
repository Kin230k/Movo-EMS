import * as functions from 'firebase-functions';
import { loginHandler } from '../handlers/loginHandlers';

export const login = functions.https.onCall(loginHandler);
