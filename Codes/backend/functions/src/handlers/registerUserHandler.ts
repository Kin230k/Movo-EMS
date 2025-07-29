// src/handlers/registerUserHandler.ts
import { getAuth, UserRecord } from 'firebase-admin/auth';
import * as functions from 'firebase-functions';
import { sendEmail } from '../utils/emailService';
export interface RegisterUserData {
  email: string;
  password: string;
  displayName?: string;
  phone: string;
  pictureUrl?: string;
  role: string;
}

export interface RegisterUserResult {
  uid: string;
}

export async function registerUserHandler(
  data: RegisterUserData,
  context: functions.https.CallableContext
): Promise<RegisterUserResult> {
  const { email, password, displayName, phone, pictureUrl, role } = data;
  if (!email || !password || !phone || !role) {
    const err = new functions.https.HttpsError(
      'invalid-argument',
      'email, password, phone, and role are all required'
    );
    // make message enumerable
    (err as any).message = err.message;
    throw err;
  }
  // const user = new User()
  try {
    // ─── Phase A: Create the Auth user
    const userRecord: UserRecord = await getAuth().createUser({
      email,
      password,
      displayName,
      phoneNumber: phone,
      photoURL: pictureUrl,
    });

    // ─── Phase B: Post‐creation work
    try {
      // 1) Generate verification link
      const verifyLink = await getAuth().generateEmailVerificationLink(email);

      // 2) Send the email
      await sendEmail(email, 'VERIFICATION', [
        displayName || 'User',
        verifyLink,
      ]);

      // 3) Persist to your DB here:
      //  await UserMapper({ uid: userRecord.uid, email, role, … });

      // Success!
      return { uid: userRecord.uid };
    } catch (postErr: any) {
      // If anything in Phase B fails, clean up the newly created user
      await getAuth()
        .deleteUser(userRecord.uid)
        .catch(() => {
          /* ignore cleanup errors */
        });

      const httpsErr = new functions.https.HttpsError(
        'internal',
        postErr.message || 'Failed during registration post‐processing'
      );
      (httpsErr as any).message = postErr.message || httpsErr.message;
      functions.logger.error('Post‐creation error:', postErr);
      throw httpsErr;
    }
  } catch (err: any) {
    // Catch any errors from Phase A or our rethrown Phase B errors
    functions.logger.error('registerUser error:', err);

    const httpsErr = new functions.https.HttpsError(
      'internal',
      err.message || 'Failed to register user'
    );
    (httpsErr as any).message = err.message || httpsErr.message;
    throw httpsErr;
  }
}
