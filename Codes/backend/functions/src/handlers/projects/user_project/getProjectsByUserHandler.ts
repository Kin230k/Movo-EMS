import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateCaller } from '../../../utils/authUtils';
import { UserProjectService } from '../../../models/project/user_project/user_project.service';

export interface GetProjectsByUserData {
  userId: string;
}

export interface UserProjectResult {
  success: boolean;
  issues?: FieldIssue[];
  data?: any;
}

export async function getProjectsByUserHandler(
  request: CallableRequest<GetProjectsByUserData>
): Promise<UserProjectResult> {
  const { userId } = request.data ?? {};
  if (!userId) return { success: false, issues: [{ field: 'userId', message: 'User ID required' }] };

  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  try {
    const records = await UserProjectService.getProjectsByUser(userId);
    return { success: true, data: records };
  } catch (e: any) {
    logger.error(e);
    return { success: false, issues: parseDbError(e) };
  }
}