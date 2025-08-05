import { onCall } from 'firebase-functions/v2/https';
import { checkServiceStatusHandler } from '../../handlers/auth/checkServiceStatusHandler';

export const checkServiceStatus = onCall({}, checkServiceStatusHandler);
