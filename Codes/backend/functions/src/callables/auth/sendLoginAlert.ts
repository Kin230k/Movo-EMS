import { onCall } from 'firebase-functions/v2/https';
import { sendLoginAlertHandler } from '../../handlers/sendLoginAlertHandler';

export const sendLoginAlert = onCall(
  { maxInstances: 10 },
  sendLoginAlertHandler
);
