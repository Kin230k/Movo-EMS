import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { User } from '../../models/auth/user/user.class';
import { Multilingual } from '../../models/multilingual.type';
import { isValidEmail, isValidPhone } from '../../utils/validators';
import { emailExists, phoneExists } from '../../utils/authUtils';
import { UserService } from '../../models/auth/user/user.service';
import { sendVerificationEmailHandler } from './sendVerificationEmailHandler';
import { parseDbError } from '../../utils/dbErrorParser';
import { FieldIssue } from '../../utils/types';

export interface RegisterUserData {
  uid: string;
  name: Multilingual;
  email: string;
  phone: string;
  role: string;
  status: string;
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
  const { uid, name, status, twoFaEnabled, email, phone, picture, role } =
    request.data;

  const issues: FieldIssue[] = [];

  // 1) Field-level validation
  if (!uid) issues.push({ field: 'uid', message: 'UID is required' });
  if (!name) issues.push({ field: 'name', message: 'Name is required' });
  if (!status) issues.push({ field: 'status', message: 'Status is required' });
  if (twoFaEnabled === undefined)
    issues.push({ field: 'twoFaEnabled', message: '2FA setting required' });
  if (!email) issues.push({ field: 'email', message: 'Email is required' });
  if (!phone) issues.push({ field: 'phone', message: 'Phone is required' });
  if (!role) issues.push({ field: 'role', message: 'Role is required' });

  // 2) Format checks
  if (email && !isValidEmail(email))
    issues.push({ field: 'email', message: 'Invalid email format' });
  if (phone && !isValidPhone(phone))
    issues.push({ field: 'phone', message: 'Phone must be in E.164 format' });

  // 3) Uniqueness checks
  if (email && (await emailExists(email)))
    issues.push({ field: 'email', message: 'Email already registered' });
  if (phone && (await phoneExists(phone)))
    issues.push({ field: 'phone', message: 'Phone number already registered' });

  // Return early if client-side issues
  if (issues.length > 0) {
    return { success: false, issues };
  }

  // 4) Build domain user
  const user = new User(
    name,
    email,
    phone,
    role,
    status,
    twoFaEnabled,
    picture || undefined,
    uid
  );

  // 5) Persist, using parseDbError to translate failures
  try {
    await UserService.registerUser(
      user.name,
      user.email,
      user.phone,
      user.role,
      user.status,
      user.twoFaEnabled,
      user.userId ?? '',
      user.picture
    );
  } catch (dbErr: any) {
    logger.error('DB write failed:', dbErr);
    const dbIssues = parseDbError(dbErr);
    return { success: false, issues: dbIssues };
  }

  // 6) Send verification email
  let emailSent = false;
  try {
    await sendVerificationEmailHandler({ data: { uid, email } } as any);
    emailSent = true;
  } catch (mailErr: any) {
    logger.error('Verification email send failed:', mailErr);
  }

  // 7) Return success
  return { success: true, emailSent };
}
