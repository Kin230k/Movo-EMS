import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { ProjectUserRoleService } from '../../../models/auth/project_user_role/project_user_role.service';
import { authenticateClient } from '../../../utils/authUtils';

export interface CreateProjectUserRoleRequestData {
  userId?: string |null;
  projectId?: string | null;
  roleId?: string | null;
}

export async function createProjectUserRoleHandler(
  request: CallableRequest<CreateProjectUserRoleRequestData>
) {
  const issues: FieldIssue[] = [];
  const auth = await authenticateClient(request);
  if (!auth.success) return auth;

  const data = request.data;
 const userId = data?.userId?.trim() ?? null;
  const projectId = data?.projectId?.trim() ?? null;
  const roleId = data?.roleId?.trim() ?? null;

  if (!userId) issues.push({ field: 'userId', message: 'User ID is required' });
  if (!projectId) issues.push({ field: 'projectId', message: 'Project ID is required' });
  if (!roleId) issues.push({ field: 'roleId', message: 'Role ID is required' });
  if (issues.length > 0) return { success: false, issues };

  try {
    await ProjectUserRoleService.createProjectUserRole(userId!, projectId!, roleId!);
    return { success: true };
  } catch (err: any) {
    logger.error('Failed to create ProjectUserRole', { err, userId, projectId, roleId });
    return { success: false, issues: [{ field: 'server', message: 'Unexpected error occurred' }] };
  }
}
