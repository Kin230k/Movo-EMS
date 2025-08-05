import { onCall } from 'firebase-functions/v2/https';
import { getUserInfoHandler } from '../../handlers/auth/getUserInfoHandler';

export const getUserInfo = onCall({}, getUserInfoHandler);
