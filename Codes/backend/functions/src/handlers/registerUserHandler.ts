import { getAuth, UserRecord } from 'firebase-admin/auth';
import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger'; // Updated logger import

import { sendEmail } from '../utils/emailService';
import userMapper from '../models/auth/user/user.mapper';
import { User } from '../models/auth/user/user.class';
import { Multilingual } from '../models/multilingual.type';
import {
  conflictError,
  isValidEmail,
  isValidPhone,
  validationError,
} from '../utils/validators';
import { emailExists, phoneExists } from '../utils/authUtils';

export interface RegisterUserData {
  password: string;
  displayName?: string;
  name: Multilingual;
  email: string;
  phone: string;
  role: string;
  status: string;
  twoFaEnabled: boolean;
  picture?: string | null;
  userId?: string | undefined;
}

export interface RegisterUserResult {
  uid: string;
}

export async function registerUserHandler(
  request: CallableRequest<RegisterUserData>
): Promise<RegisterUserResult> {
  const data = request.data;
  const {
    name,
    status,
    twoFaEnabled,
    email,
    password,
    displayName,
    phone,
    picture,
    role,
  } = data;

  // Check required fields
  if (
    !name ||
    !status ||
    twoFaEnabled === undefined ||
    !email ||
    !password ||
    !displayName ||
    !phone ||
    !role
  ) {
    throw validationError(
      'name, status, twoFaEnabled, email, password, displayName, phone, and role are required'
    );
  }

  // Validate email format
  if (!isValidEmail(email)) {
    throw validationError('Invalid email format');
  }

  // Validate phone format
  if (!isValidPhone(phone)) {
    throw validationError('Phone must be in E.164 format (e.g., +1234567890)');
  }

  // Check for existing accounts
  if (await emailExists(email)) {
    throw conflictError('Email already registered');
  }

  if (await phoneExists(phone)) {
    throw conflictError('Phone number already registered');
  }

  try {
    // Create Auth user
    const userRecord: UserRecord = await getAuth().createUser({
      email,
      password,
      displayName,
      phoneNumber: phone,
      photoURL: picture || undefined,
    });

    const user = new User(
      name,
      email,
      phone,
      role,
      status,
      twoFaEnabled,
      picture || undefined,
      userRecord.uid
    );

    try {
      // Generate verification link
      const verifyLink = await getAuth().generateEmailVerificationLink(email);

      // Send verification email
      await sendEmail(email, 'VERIFICATION', [
        displayName || 'User',
        verifyLink,
      ]);

      // Save to database
      await userMapper.save(user);

      return { uid: userRecord.uid };
    } catch (postErr: any) {
      // Cleanup auth user on failure
      await getAuth()
        .deleteUser(userRecord.uid)
        .catch(() => {
          logger.error('Failed to cleanup user after DB error');
        });

      logger.error('Post-creation error:', postErr);
      throw new HttpsError(
        'internal',
        postErr.message || 'Registration completion failed'
      );
    }
  } catch (err: any) {
    logger.error('Registration error:', err);

    // Handle Firebase Auth errors
    if (err.code === 'auth/email-already-exists') {
      throw conflictError('Email already registered');
    }
    if (err.code === 'auth/phone-number-already-exists') {
      throw conflictError('Phone number already registered');
    }

    throw new HttpsError('internal', err.message || 'User registration failed');
  }
}
