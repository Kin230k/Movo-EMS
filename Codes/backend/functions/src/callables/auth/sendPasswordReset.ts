import { onCall } from 'firebase-functions/v2/https';
import { sendPasswordResetHandler } from '../../handlers/sendPasswordResetHandler';

export const sendPasswordReset = onCall(
  { maxInstances: 10 },
  sendPasswordResetHandler
);
