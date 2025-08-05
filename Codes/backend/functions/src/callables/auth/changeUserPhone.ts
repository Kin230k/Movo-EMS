import { onCall } from 'firebase-functions/v2/https';
import { changeUserPhoneHandler } from '../../handlers/auth/changeUserPhoneHandler';

export const changeUserPhone = onCall({}, changeUserPhoneHandler);
