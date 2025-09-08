import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { ProjectUserRoleService } from '../../../models/auth/project_user_role/project_user_role.service';
import { authenticateClient } from '../../../utils/authUtils';

export interface DeleteByUserAndProjectRequestData {
  userId?: string | null;
  projectId?: string | null;
}

export async function deleteProjectUserRolesByUserAndProjectHandler(
  request: CallableRequest<DeleteByUserAndProjectRequestData>
) {
  const issues: FieldIssue[] = [];
  const auth = await authenticateClient(request);
  if (!auth.success) return auth;

  const data = request.data;
  const userId = typeof data.userId === 'string' ? data.userId.trim() : null;
  const projectId = typeof data.projectId === 'string' ? data.projectId.trim() : null;

  if (!userId) issues.push({ field: 'userId', message: 'User ID is required' });
  if (!projectId) issues.push({ field: 'projectId', message: 'Project ID is required' });
  if (issues.length > 0) return { success: false, issues };

  try {
    await ProjectUserRoleService.deleteProjectUserRoleByUserProject(projectId!,userId!);
    return { success: true };
  } catch (err: any) {
    logger.error('Failed to delete ProjectUserRole', { err, projectId,userId });
    return { success: false, issues: [{ field: 'server', message: 'Unexpected error occurred' }] };
  }
}
