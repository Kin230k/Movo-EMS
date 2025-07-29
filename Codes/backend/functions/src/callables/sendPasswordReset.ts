import * as functions from 'firebase-functions';
import { sendPasswordResetHandler } from '../handlers/sendPasswordResetHandler';

export const sendPasswordReset = functions.https.onCall(
  sendPasswordResetHandler
);
