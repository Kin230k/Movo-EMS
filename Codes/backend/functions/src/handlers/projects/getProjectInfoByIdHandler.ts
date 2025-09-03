import * as logger from 'firebase-functions/logger';
import { CallableRequest } from 'firebase-functions/v2/https';
import { FieldIssue } from '../../utils/types';
import { parseDbError } from '../../utils/dbErrorParser';
import { ProjectService } from '../../models/project/project/project.service';
import { authenticateUser } from '../../utils/authUtils';
export interface GetProjectInfoByIdRequestData {
  projectId?: string | null;
}
export async function getProjectInfoByIdHandler(
  request: CallableRequest<GetProjectInfoByIdRequestData>
) {
  const issues: FieldIssue[] = [];

  const auth = await authenticateUser(request);
  if (!auth.success) return auth;

  const { projectId } = request.data || {};
  if (!projectId) {
    issues.push({
      field: 'input',
      message: 'Missing required field: projectId',
    });
    return { success: false, issues };
  }

  try {
    const project = await ProjectService.getProjectInfoById(projectId);
    if (!project) {
      return {
        success: false,
        issues: [{ field: 'project', message: 'Project not found' }],
      };
    }
    return { success: true, project };
  } catch (err: any) {
    logger.error('Project fetch failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
