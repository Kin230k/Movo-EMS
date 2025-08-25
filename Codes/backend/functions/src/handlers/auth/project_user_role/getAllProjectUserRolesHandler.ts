import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { ProjectUserRoleService } from '../../../models/auth/project_user_role/project_user_role.service';
import { authenticateClient } from '../../../utils/authUtils';

export async function getAllProjectUserRolesHandler(request: CallableRequest) {
  const auth = await authenticateClient(request);
  if (!auth.success) return auth;

  try {
    const result = await ProjectUserRoleService.getAllProjectUserRoles();
    return { success: true, data: result };
  } catch (err: any) {
    logger.error('Failed to get all ProjectUserRoles', { err });
    return { success: false, issues: [{ field: 'server', message: 'Unexpected error occurred' }] };
  }
}
