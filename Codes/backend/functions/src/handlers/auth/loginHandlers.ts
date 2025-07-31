import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { User } from '../../models/auth/user/user.class';
import { UserService } from '../../models/auth/user/user.service';

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResult {
  idToken: string;
  refreshToken: string;
  user: User;
}

export async function loginHandler(
  request: CallableRequest<LoginData>
): Promise<LoginResult> {
  const { email, password } = request.data;

  if (!email || !password) {
    throw new HttpsError(
      'invalid-argument',
      'Email and password are both required.'
    );
  }

  const apiKey = process.env.FIREBASE_API_KEY;
  if (!apiKey) {
    throw new HttpsError(
      'failed-precondition',
      'Missing Firebase API key in environment.'
    );
  }

  let idToken: string;
  let refreshToken: string;
  let uid: string;

  try {
    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );

    const body = await resp.json();

    if (!resp.ok) {
      const msg: string = body.error?.message;
      if (msg === 'EMAIL_NOT_FOUND' || msg === 'INVALID_PASSWORD') {
        throw new HttpsError('unauthenticated', 'Invalid email or password.');
      }
      if (msg === 'USER_DISABLED') {
        throw new HttpsError('permission-denied', 'User account is disabled.');
      }
      logger.error('signInWithPassword failed:', body);
      throw new HttpsError('internal', 'Failed to authenticate user.');
    }

    idToken = body.idToken;
    refreshToken = body.refreshToken;
    uid = body.localId;
  } catch (err: any) {
    if (err instanceof HttpsError) throw err;
    logger.error('loginHandler → fetch error:', err);
    throw new HttpsError('internal', 'Authentication request failed.');
  }

  let user: User | null;
  try {
    user = await UserService.getUserById(uid);
  } catch (dbErr: any) {
    logger.error('loginHandler → userMapper.getById error:', dbErr);
    throw new HttpsError('internal', 'Failed to fetch user profile.');
  }

  if (!user) {
    throw new HttpsError('not-found', `No user profile found for uid=${uid}.`);
  }

  return { idToken, refreshToken, user };
}
