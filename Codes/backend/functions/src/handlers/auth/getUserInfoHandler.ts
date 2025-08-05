import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { UserService } from '../../models/auth/user/user.service';
import { User } from '../../models/auth/user/user.class';
import { UserStatus } from '../../models/auth/user/user_status.enum';
import { parseDbError } from '../../utils/dbErrorParser';
import { FieldIssue } from '../../utils/types';
import { firebaseUidToUuid } from '../../utils/firebaseUidToUuid';

export interface GetUserInfoResult {
  success: boolean;
  user?: User;
  issues?: FieldIssue[];
}

export async function getUserInfoHandler(
  request: CallableRequest
): Promise<GetUserInfoResult> {
  const issues: FieldIssue[] = [];

  // 1) Validate auth context
  if (!request.auth || !request.auth.uid) {
    issues.push({
      field: 'auth',
      message: 'Must be signed in to get user info',
    });
    return { success: false, issues };
  }

  // 2) Resolve target UID
  const targetUserId = firebaseUidToUuid(request.auth.uid);
  if (!targetUserId) {
    issues.push({ field: 'uid', message: 'UID is required' });
    return { success: false, issues };
  }

  // 3) Fetch user record
  let user: User | null;
  try {
    user = await UserService.getUserById(targetUserId);
  } catch (err: any) {
    logger.error('DB fetch failed:', err);
    const dbIssues = parseDbError(err);
    return { success: false, issues: dbIssues };
  }

  if (!user) {
    return {
      success: false,
      issues: [{ field: 'uid', message: 'User not found' }],
    };
  }

  // 4) Check status
  if (user.getStatus !== UserStatus.Active) {
    return {
      success: false,
      issues: [{ field: 'status', message: 'User is not active' }],
    };
  }

  // 5) Return user data
  return { success: true, user };
}
