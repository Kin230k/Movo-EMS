import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { ProjectUserRoleService } from '../../../models/auth/project_user_role/project_user_role.service';
import { authenticateClient } from '../../../utils/authUtils';

export interface GetProjectUserRoleRequestData {
  projectUserRoleId?: string | null;
}

export async function getProjectUserRoleHandler(
  request: CallableRequest<GetProjectUserRoleRequestData>
) {
  const auth = await authenticateClient(request);
  if (!auth.success) return auth;

  const id = typeof request.data.projectUserRoleId === 'string' ? request.data.projectUserRoleId.trim() : null;
  if (!id) return { success: false, issues: [{ field: 'projectUserRoleId', message: 'ID is required' }] };

  try {
    const result = await ProjectUserRoleService.getProjectUserRoleById(id);
    return { success: true, data: result };
  } catch (err: any) {
    logger.error('Failed to get ProjectUserRole', { err, id });
    return { success: false, issues: [{ field: 'server', message: 'Unexpected error occurred' }] };
  }
}
