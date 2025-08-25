import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import admin from 'firebase-admin';

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
  // email and phone are taken from Firebase Auth, not from client
  twoFaEnabled: boolean;
  picture?: string | null;
}

export interface RegisterUserResult {
  success: boolean;
  issues?: FieldIssue[];
  emailSent?: boolean;
}

// default role assigned to new users
const DEFAULT_ROLE = 'Main User';

export async function registerUserHandler(
  request: CallableRequest<RegisterUserData>
): Promise<RegisterUserResult> {
  const { name, twoFaEnabled, picture } = request.data ?? ({} as any);
  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  const uid = request.auth!.uid;
  const issues: FieldIssue[] = [];

  // 1) Field-level validation (client-provided fields where appropriate)
  if (!uid) issues.push({ field: 'uid', message: 'UID is required' });
  if (!name) issues.push({ field: 'name', message: 'Name is required' });

  if (twoFaEnabled === undefined)
    issues.push({ field: 'twoFaEnabled', message: '2FA setting required' });

  // Return early if client-side issues
  if (issues.length > 0) {
    return { success: false, issues };
  }

  // 2) Get authoritative contact details from Firebase Auth (server-side)
  let emailFromAuth: string | undefined;
  let phoneFromAuth: string | undefined;

  try {
    const firebaseUser = await admin.auth().getUser(uid);
    emailFromAuth = firebaseUser.email ?? undefined;
    phoneFromAuth = firebaseUser.phoneNumber ?? undefined;
  } catch (e) {
    // Fallback: some runtimes may include token claims with minimal info
    logger.warn(
      `admin.auth().getUser(${uid}) failed, falling back to request.auth.token if available.`
    );
    const token = request.auth?.token;
    if (token) {
      emailFromAuth = (token as any).email ?? undefined;
      // Firebase token phone claim often named phone_number
      phoneFromAuth =
        (token as any).phone_number ?? (token as any).phoneNumber ?? undefined;
    }
  }

  // If client sent contact fields, log that we will ignore them (helpful for debugging)
  const clientProvidedEmail = (request.data as any)?.email;
  const clientProvidedPhone = (request.data as any)?.phone;
  if (clientProvidedEmail || clientProvidedPhone) {
    logger.debug(
      'Client provided contact info will be ignored in favor of Firebase Auth',
      {
        clientProvidedEmail,
        clientProvidedPhone,
        emailFromAuth,
        phoneFromAuth,
      }
    );
  }

  // 3) Ensure we have at least one contact method from Firebase Auth
  if (!emailFromAuth && !phoneFromAuth) {
    return {
      success: false,
      issues: [
        {
          field: 'contact',
          message:
            'No contact information found on Firebase Auth. Please add an email or phone number to the user in Firebase.',
        },
      ],
    };
  }

  // 4) Format checks (only if values exist from auth)
  if (emailFromAuth && !isValidEmail(emailFromAuth))
    issues.push({
      field: 'email',
      message: 'Email from Auth has invalid format',
    });

  if (phoneFromAuth && !isValidPhone(phoneFromAuth))
    issues.push({
      field: 'phone',
      message: 'Phone from Auth must be in E.164 format',
    });

  if (issues.length > 0) return { success: false, issues };

  // 5) Uniqueness / existence checks (only if provided by auth)
  if (emailFromAuth && !(await emailExists(emailFromAuth))) {
    issues.push({ field: 'email', message: 'Email has no record registered' });
  }

  if (phoneFromAuth && !(await phoneExists(phoneFromAuth))) {
    issues.push({
      field: 'phone',
      message: 'Phone number has no record registered',
    });
  }

  if (issues.length > 0) return { success: false, issues };

  // 6) Persist user (convert uid -> uuid for DB). Role is set to DEFAULT_ROLE.
  try {
    await UserService.registerUser(
      name,
      emailFromAuth,
      phoneFromAuth,
      DEFAULT_ROLE,
      UserStatus.Active,
      twoFaEnabled,
      firebaseUidToUuid(uid),
      picture ?? ''
    );
  } catch (dbErr: any) {
    logger.error(
      'DB write failed:',
      (dbErr?.message || String(dbErr)).split('\n')[0]
    );
    const dbIssues = parseDbError(dbErr);
    return { success: false, issues: dbIssues };
  }

  // 7) Send verification email (only if email exists on Firebase Auth)
  let emailSent = false;
  if (emailFromAuth) {
    try {
      // Reuse existing handler — build a small fake request object preserving original auth/context
      const fakeRequest = {
        ...request,
        data: { email: emailFromAuth },
      } as CallableRequest<{ email: string }>;

      const results = await sendVerificationEmailHandler(fakeRequest);
      if (!results.success) {
        // If handler returns a structured error, log it and continue (do not fail registration)
        logger.warn('sendVerificationEmailHandler returned failure:', results);
      } else {
        emailSent = true;
      }
    } catch (mailErr: any) {
      logger.error(
        'Verification email send failed:',
        (mailErr?.message || String(mailErr)).split('\n')[0]
      );
    }
  }

  // 8) Return success
  return { success: true, emailSent };
}
