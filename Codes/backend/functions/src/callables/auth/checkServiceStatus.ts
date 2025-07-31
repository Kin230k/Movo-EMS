import { onCall } from 'firebase-functions/v2/https';
import { checkServiceStatusHandler } from '../../handlers/checkServiceStatusHandler';

export const checkServiceStatus = onCall(
  { maxInstances: 10 },
  checkServiceStatusHandler
);
