import { onCall } from 'firebase-functions/v2/https';
import { editUserInfoHandler } from '../../handlers/auth/editUserInfoHandler';

export const editUserInfo = onCall({}, editUserInfoHandler);
