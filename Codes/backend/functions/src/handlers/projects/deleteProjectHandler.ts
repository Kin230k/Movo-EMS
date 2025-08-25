import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../utils/types';
import { parseDbError } from '../../utils/dbErrorParser';
import { ProjectService } from '../../models/project/project/project.service';
import { authenticateClient } from '../../utils/authUtils';

export interface DeleteProjectData {
  projectId: string;
}

export async function deleteProjectHandler(request: CallableRequest<DeleteProjectData>) {
  const issues: FieldIssue[] = [];

  const auth = await authenticateClient(request);
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
    await ProjectService.deleteProject(projectId);
    return { success: true };
  } catch (err: any) {
    logger.error('Project deletion failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}