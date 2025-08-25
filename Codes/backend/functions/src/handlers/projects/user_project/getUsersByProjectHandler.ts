import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateCaller } from '../../../utils/authUtils';
import { UserProjectService } from '../../../models/project/user_project/user_project.service';

export interface GetUsersByProjectData {
  projectId: string;
}

export interface UserProjectResult {
  success: boolean;
  issues?: FieldIssue[];
  data?: any;
}

export async function getUsersByProjectHandler(
  request: CallableRequest<GetUsersByProjectData>
): Promise<UserProjectResult> {
  const { projectId } = request.data ?? {};
  if (!projectId) return { success: false, issues: [{ field: 'projectId', message: 'Project ID required' }] };

  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  try {
    const records = await UserProjectService.getUsersByProject(projectId);
    return { success: true, data: records };
  } catch (e: any) {
    logger.error(e);
    return { success: false, issues: parseDbError(e) };
  }
}