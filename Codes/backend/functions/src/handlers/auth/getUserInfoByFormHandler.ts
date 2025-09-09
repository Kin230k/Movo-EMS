import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { UserService } from '../../models/auth/user/user.service';
import { User } from '../../models/auth/user/user.class';
import { parseDbError } from '../../utils/dbErrorParser';
import { FieldIssue } from '../../utils/types';
import { authenticateUser } from '../../utils/authUtils';

export interface GetUserInfoByFormData {
  formId: string;
}

export interface GetUserInfoByFormResult {
  success: boolean;
  user?: User;
  issues?: FieldIssue[];
}

export async function getUserInfoByFormHandler(
  request: CallableRequest<GetUserInfoByFormData>
): Promise<GetUserInfoByFormResult> {
  // 1) Authenticate the caller
  const auth = await authenticateUser(request);
  if (!auth.success) return auth;

  // 2) Validate input
  const issues: FieldIssue[] = [];
  const { formId } = request.data || {};

  if (!formId) {
    issues.push({ field: 'formId', message: 'formId is required' });
  } 
  

  if (issues.length > 0) {
    return { success: false, issues };
  }

  // 3) Fetch user record by email
  let user: User | null;
  try {
    user = await UserService.getUserByForm(formId);
  } catch (err: any) {
    logger.error('DB fetch by email failed:', err);
    const dbIssues = parseDbError(err);
    return { success: false, issues: dbIssues };
  }

  if (!user) {
    return {
      success: false,
      issues: [{ field: 'email', message: 'User not found' }],
    };
  }


  // 5) Return user data
  return { success: true, user };
}