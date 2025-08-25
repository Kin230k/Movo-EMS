// src/handlers/auth/changeUserPhoneHandler.ts
import { getAuth } from 'firebase-admin/auth';
import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../utils/types';
import { isValidPhone } from '../../utils/validators';
import { UserService } from '../../models/auth/user/user.service';
import { firebaseUidToUuid } from '../../utils/firebaseUidToUuid';
import { authenticateCaller } from '../../utils/authUtils';

export interface ChangePhoneData {
  newPhone: string;
}
export interface ChangePhoneResult {
  success: boolean;
  issues?: FieldIssue[];
}

export async function changeUserPhoneHandler(
  request: CallableRequest<ChangePhoneData>
): Promise<ChangePhoneResult> {
  const issues: FieldIssue[] = [];

  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  // 2) Validate newPhone
  const newPhone = request.data?.newPhone;
  if (!newPhone) {
    issues.push({ field: 'newPhone', message: 'newPhone is required' });
  } else if (!isValidPhone(newPhone)) {
    issues.push({ field: 'newPhone', message: 'Invalid newPhone format' });
  }

  if (issues.length > 0) {
    return { success: false, issues };
  }

  const uid = request.auth!.uid;

  let beforeUser;
  try {
    beforeUser = await getAuth().getUser(uid);
    if (!beforeUser) {
      throw 'User not found';
    }
  } catch (err: any) {
    logger.error('User fetch error:', err);
    return {
      success: false,
      issues: [{ field: 'uid', message: 'User not found' }],
    };
  }

  // 4) Update Auth and application database
  try {
    // Firebase Auth's phone field is `phoneNumber`
    await getAuth().updateUser(uid, { phoneNumber: newPhone });
    await UserService.changePhone(firebaseUidToUuid(uid), newPhone);
  } catch (err: any) {
    logger.error('Auth update error:', err);
    return {
      success: false,
      issues: [
        {
          field: 'newPhone',
          message: err.message || 'Failed to update phone number',
        },
      ],
    };
  }

  return { success: true };
}
