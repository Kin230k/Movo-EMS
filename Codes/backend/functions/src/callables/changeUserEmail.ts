import * as functions from 'firebase-functions';
import { changeUserEmailHandler } from '../handlers/changeUserEmailHandler';

export const changeUserEmail = functions.https.onCall(changeUserEmailHandler);
