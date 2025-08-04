import { onCall } from 'firebase-functions/v2/https';
import { sendVerificationEmailHandler } from '../../handlers/auth/sendVerificationEmailHandler';

// Initialize the Firebase Admin SDK (if not already initialized elsewhere)

// Configure how your email verification link should behave:

export const sendVerificationEmail = onCall({}, sendVerificationEmailHandler);
