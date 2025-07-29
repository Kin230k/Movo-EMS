import * as functions from 'firebase-functions';
import { sendLoginAlertHandler } from '../handlers/sendLoginAlertHandler';

export const sendLoginAlert = functions.https.onCall(sendLoginAlertHandler);
