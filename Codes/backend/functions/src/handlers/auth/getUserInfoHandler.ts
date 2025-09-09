import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { UserService } from '../../models/auth/user/user.service';
import { User } from '../../models/auth/user/user.class';
import { UserStatus } from '../../models/auth/user/user_status.enum';
import { parseDbError } from '../../utils/dbErrorParser';
import { FieldIssue } from '../../utils/types';
import { authenticateUser } from '../../utils/authUtils';

export interface GetUserInfoResult {
  success: boolean;
  user?: User;
  issues?: FieldIssue[];
}

export async function getUserInfoHandler(
  request: CallableRequest
): Promise<GetUserInfoResult> {
  const auth = await authenticateUser(request);
  if (!auth.success) return auth;

  // 3) Fetch user record
  let user: User | null;
  try {
    user = await UserService.getUserById(auth.callerUuid);
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
