import { onCall } from 'firebase-functions/v2/https';
import { changeUserEmailHandler } from '../../handlers/auth/changeUserEmailHandler';

export const changeUserEmail = onCall({}, changeUserEmailHandler);
