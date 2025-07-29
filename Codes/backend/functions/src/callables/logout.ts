import * as functions from 'firebase-functions';
import { logoutHandler } from '../handlers/logoutHandlers';

export const logout = functions.https.onCall(logoutHandler);
