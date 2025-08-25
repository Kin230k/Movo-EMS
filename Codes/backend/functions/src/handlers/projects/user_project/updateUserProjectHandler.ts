import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateCaller } from '../../../utils/authUtils';
import { UserProjectService } from '../../../models/project/user_project/user_project.service';

export interface UpdateUserProjectData {
  userProjectId: string;
  userId: string;
  projectId: string;
}

export interface UserProjectResult {
  success: boolean;
  issues?: FieldIssue[];
  data?: any;
}

export async function updateUserProjectHandler(
  request: CallableRequest<UpdateUserProjectData>
): Promise<UserProjectResult> {
  const { userProjectId, userId, projectId } = request.data ?? {};
  const issues: FieldIssue[] = [];

  if (!userProjectId) issues.push({ field: 'userProjectId', message: 'ID required' });
  if (!userId) issues.push({ field: 'userId', message: 'User ID required' });
  if (!projectId) issues.push({ field: 'projectId', message: 'Project ID required' });

  if (issues.length > 0) return { success: false, issues };

  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  try {
    const userProject = await UserProjectService.updateUserProject(userProjectId, userId, projectId );
    return { success: true, data: userProject };
  } catch (e: any) {
    logger.error(e);
    return { success: false, issues: parseDbError(e) };
  }
}
