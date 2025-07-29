import * as functions from 'firebase-functions';
import { checkServiceStatusHandler } from '../handlers/checkServiceStatusHandler';
export const checkServiceStatus = functions.https.onCall(
  checkServiceStatusHandler
);
