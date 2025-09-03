import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { ProjectUserRoleService } from '../../../models/auth/project_user_role/project_user_role.service';
import { authenticateClient } from '../../../utils/authUtils';
import { RateService } from '../../../models/project/rate/rate.service';

export interface UpdateProjectUserRoleRequestData {
  projectUserRoleId?: string | null;
  userId?: string | null;
  projectId?: string | null;
  roleId?: string | null;
  hourlyRate?:number|null;
}

export async function updateProjectUserRoleHandler(
  request: CallableRequest<UpdateProjectUserRoleRequestData>
) {
  const issues: FieldIssue[] = [];
  const auth = await authenticateClient(request);
  if (!auth.success) return auth;

  const data = request.data;
  const id = typeof data.projectUserRoleId === 'string' ? data.projectUserRoleId.trim() : null;
  const userId = typeof data.userId === 'string' ? data.userId.trim() : null;
  const projectId = typeof data.projectId === 'string' ? data.projectId.trim() : null;
  const roleId = typeof data.roleId === 'string' ? data.roleId.trim() : null;
  const hourlyRate = typeof data.hourlyRate === 'number' ? data.hourlyRate : null; 

  if (!id) issues.push({ field: 'projectUserRoleId', message: 'ID is required' });
  if (!userId) issues.push({ field: 'userId', message: 'User ID is required' });
  if (!projectId) issues.push({ field: 'projectId', message: 'Project ID is required' });
  if (!roleId) issues.push({ field: 'roleId', message: 'Role ID is required' });
  if (issues.length > 0) return { success: false, issues };

  try {
    await ProjectUserRoleService.updateProjectUserRole(id!, userId!, projectId!, roleId!);
    if(hourlyRate)
    await RateService.updateRateByUser(hourlyRate!,userId!,projectId!);
    return { success: true };
  } catch (err: any) {
    logger.error('Failed to update ProjectUserRole', { err, id, userId, projectId, roleId });
    return { success: false, issues: [{ field: 'server', message: 'Unexpected error occurred' }] };
  }
}
