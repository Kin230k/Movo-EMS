import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { Multilingual } from '../../models/multilingual.type';
import { isValidEmail, isValidPhone } from '../../utils/validators';
import {
  authenticateCaller,
  emailExists,
  phoneExists,
} from '../../utils/authUtils';
import { UserService } from '../../models/auth/user/user.service';
import { sendVerificationEmailHandler } from './sendVerificationEmailHandler';
import { parseDbError } from '../../utils/dbErrorParser';
import { FieldIssue } from '../../utils/types';
import { UserStatus } from '../../models/auth/user/user_status.enum';
import { firebaseUidToUuid } from '../../utils/firebaseUidToUuid';

export interface RegisterUserData {
  name: Multilingual;
  email?: string;
  phone?: string;
  role: string;

  twoFaEnabled: boolean;
  picture?: string | null;
}

export interface RegisterUserResult {
  success: boolean;
  issues?: FieldIssue[];
  emailSent?: boolean;
}

export async function registerUserHandler(
  request: CallableRequest<RegisterUserData>
): Promise<RegisterUserResult> {
  const { name, twoFaEnabled, email, phone, picture, role } = request.data;
  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;
  const uid = request.auth!.uid;
  const issues: FieldIssue[] = [];

  // 1) Field-level validation
  if (!uid) issues.push({ field: 'uid', message: 'UID is required' });
  if (!name) issues.push({ field: 'name', message: 'Name is required' });

  if (twoFaEnabled === undefined)
    issues.push({ field: 'twoFaEnabled', message: '2FA setting required' });

  if (!role) issues.push({ field: 'role', message: 'Role is required' });

  // Require at least one contact method: email OR phone (or both)
  if (!email && !phone) {
    issues.push({
      field: 'contact',
      message: 'Either email or phone is required',
    });
  }

  // 2) Format checks (only if provided)
  if (email && !isValidEmail(email))
    issues.push({ field: 'email', message: 'Invalid email format' });

  if (phone && !isValidPhone(phone))
    issues.push({ field: 'phone', message: 'Phone must be in E.164 format' });

  // 3) Uniqueness / existence checks (only if provided)
  if (email && !(await emailExists(email)))
    issues.push({ field: 'email', message: 'Email has no record registered' });

  if (phone && !(await phoneExists(phone)))
    issues.push({
      field: 'phone',
      message: 'Phone number has no record registered',
    });

  // Return early if client-side issues
  if (issues.length > 0) {
    return { success: false, issues };
  }

  // 4) Build domain user

  // 5) Persist, using parseDbError to translate failures
  try {
    await UserService.registerUser(
      name,
      email,
      phone,
      role,
      UserStatus.Active,
      twoFaEnabled,
      firebaseUidToUuid(uid),
      picture ?? ''
    );
  } catch (dbErr: any) {
    logger.error('DB write failed:', dbErr);
    const dbIssues = parseDbError(dbErr);
    return { success: false, issues: dbIssues };
  }

  // 6) Send verification email (only if email provided)
  let emailSent = false;
  if (email) {
    try {
      let results = await sendVerificationEmailHandler({
        ...request,
        data: { email: email },
      });
      if (!results.success) {
        throw results.message;
      }
      emailSent = true;
    } catch (mailErr: any) {
      logger.error('Verification email send failed:', mailErr);
    }
  }

  // 7) Return success
  return { success: true, emailSent };
}
