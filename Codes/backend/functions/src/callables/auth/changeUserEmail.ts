import { onCall } from 'firebase-functions/v2/https';
import { changeUserEmailHandler } from '../../handlers/changeUserEmailHandler';

export const changeUserEmail = onCall(
  { maxInstances: 10 },
  changeUserEmailHandler
);
