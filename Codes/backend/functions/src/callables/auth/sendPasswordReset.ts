import { onCall } from 'firebase-functions/v2/https';
import { sendPasswordResetHandler } from '../../handlers/auth/sendPasswordResetHandler';

export const sendPasswordReset = onCall({}, sendPasswordResetHandler);
