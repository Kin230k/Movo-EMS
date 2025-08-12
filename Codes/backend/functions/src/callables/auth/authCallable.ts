import { onCall } from 'firebase-functions/v2/https';

import { changeUserEmailHandler } from '../../handlers/auth/changeUserEmailHandler';
import { changeUserPhoneHandler } from '../../handlers/auth/changeUserPhoneHandler';
import { checkServiceStatusHandler } from '../../handlers/auth/checkServiceStatusHandler';
import { sendVerificationEmailHandler } from '../../handlers/auth/sendVerificationEmailHandler';
import { editUserInfoHandler } from '../../handlers/auth/editUserInfoHandler';
import { getUserInfoHandler } from '../../handlers/auth/getUserInfoHandler';
import { registerUserHandler } from '../../handlers/auth/registerUserHandler';
import { sendLoginAlertHandler } from '../../handlers/auth/sendLoginAlertHandler';
import { sendPasswordResetHandler } from '../../handlers/auth/sendPasswordResetHandler';

export const changeUserEmail = onCall({}, changeUserEmailHandler);

export const changeUserPhone = onCall({}, changeUserPhoneHandler);

export const checkServiceStatus = onCall({}, checkServiceStatusHandler);

export const editUserInfo = onCall({}, editUserInfoHandler);

export const getUserInfo = onCall({}, getUserInfoHandler);

export const registerUser = onCall({}, registerUserHandler);

export const sendLoginAlert = onCall({}, sendLoginAlertHandler);

export const sendPasswordReset = onCall({}, sendPasswordResetHandler);

export const sendVerificationEmail = onCall({}, sendVerificationEmailHandler);
