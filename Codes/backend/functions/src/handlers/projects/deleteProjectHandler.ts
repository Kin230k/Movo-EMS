import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../utils/types';
import { parseDbError } from '../../utils/dbErrorParser';
import { ProjectService } from '../../models/project/project/project.service';

export async function deleteProjectHandler(request: CallableRequest) {
  const issues: FieldIssue[] = [];

  if (!request.auth?.uid) {
    issues.push({ field: 'auth', message: 'Must be signed in' });
    return { success: false, issues };
  }

  const { projectId } = request.data || {};
  if (!projectId) {
    issues.push({
      field: 'input',
      message: 'Missing required field: projectId',
    });
    return { success: false, issues };
  }

  try {
    await ProjectService.deleteProject(projectId);
    return { success: true };
  } catch (err: any) {
    logger.error('Project deletion failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
