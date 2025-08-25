// getProjectUsersHandler.ts
import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { UserService } from '../../models/auth/user/user.service';
import { ProjectUser } from '../../models/auth/user/user.mapper';
import { parseDbError } from '../../utils/dbErrorParser';
import { FieldIssue } from '../../utils/types';
import { authenticateClient } from '../../utils/authUtils';

export interface GetProjectUsersData {
  projectId: string;
}
export interface GetProjectUsersResult {
  success: boolean;
  users?: ProjectUser[];
  issues?: FieldIssue[];
}

export async function getProjectUsersHandler(
  request: CallableRequest<GetProjectUsersData>
): Promise<GetProjectUsersResult> {
  // Authenticate as client instead of user
  const auth = await authenticateClient(request);
  if (!auth.success) return auth;

  const { projectId } = request.data;
  
  // Validate projectId
  if (!projectId) {
    return {
      success: false,
      issues: [{ field: 'projectId', message: 'Project ID is required' }],
    };
  }

  // Fetch project users
  let users: ProjectUser[];
  try {
    users = await UserService.getProjectUsers(projectId);
  } catch (err: any) {
    logger.error('DB fetch failed:', err);
    const dbIssues = parseDbError(err);
    return { success: false, issues: dbIssues };
  }

  // Return users data
  return { success: true, users };
}