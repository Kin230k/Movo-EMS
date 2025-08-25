import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';


import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateCaller } from '../../../utils/authUtils';
import { UserProjectService } from '../../../models/project/user_project/user_project.service';

export interface CreateUserProjectData {
  userId: string;
  projectId: string;
}

export interface UserProjectResult {
  success: boolean;
  issues?: FieldIssue[];
  data?: any;
}

export async function createUserProjectHandler(
  request: CallableRequest<CreateUserProjectData>
): Promise<UserProjectResult> {
  const { userId, projectId } = request.data ?? {};
  const issues: FieldIssue[] = [];

  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  if (!userId) issues.push({ field: 'userId', message: 'User ID is required' });
  if (!projectId) issues.push({ field: 'projectId', message: 'Project ID is required' });

  if (issues.length > 0) return { success: false, issues };

  try {
    const userProject = await UserProjectService.createUserProject(userId, projectId);
    return { success: true, data: userProject };
  } catch (e: any) {
    logger.error(e);
    return { success: false, issues: parseDbError(e) };
  }
}
