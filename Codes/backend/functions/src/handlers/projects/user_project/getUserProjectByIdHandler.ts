import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateCaller } from '../../../utils/authUtils';
import { UserProjectService } from '../../../models/project/user_project/user_project.service';

export interface GetUserProjectByIdData {
  userProjectId: string;
}

export interface UserProjectResult {
  success: boolean;
  issues?: FieldIssue[];
  data?: any;
}

export async function getUserProjectByIdHandler(
  request: CallableRequest<GetUserProjectByIdData>
): Promise<UserProjectResult> {
  const { userProjectId } = request.data ?? {};
  if (!userProjectId) return { success: false, issues: [{ field: 'userProjectId', message: 'ID required' }] };

  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  try {
    const record = await UserProjectService.getUserProjectById(userProjectId);
    return { success: true, data: record };
  } catch (e: any) {
    logger.error(e);
    return { success: false, issues: parseDbError(e) };
  }
}
