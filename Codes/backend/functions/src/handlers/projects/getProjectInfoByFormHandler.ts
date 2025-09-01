import * as logger from 'firebase-functions/logger';
import { CallableRequest } from 'firebase-functions/v2/https';
import { FieldIssue } from '../../utils/types';
import { parseDbError } from '../../utils/dbErrorParser';
import { ProjectService } from '../../models/project/project/project.service';
import { authenticateUser } from '../../utils/authUtils';
export interface GetProjectInfoByFormRequestData {
  fromId?: string | null;
}
export async function getProjectInfoByFormHandler(
  request: CallableRequest<GetProjectInfoByFormRequestData>
) {
  const issues: FieldIssue[] = [];

  const auth = await authenticateUser(request);
  if (!auth.success) return auth;

  const { fromId } = request.data || {};
  if (!fromId) {
    issues.push({ field: 'input', message: 'Missing required field: fromId' });
    return { success: false, issues };
  }

  try {
    const project = await ProjectService.getProjectInfoByForm(fromId);
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
