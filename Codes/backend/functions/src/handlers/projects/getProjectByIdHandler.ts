import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../utils/types';
import { parseDbError } from '../../utils/dbErrorParser';
import { ProjectService } from '../../models/project/project/project.service';
interface getProjectByIdData {
  projectId: string;
}
export async function getProjectByIdHandler(
  request: CallableRequest<getProjectByIdData>
) {
  const issues: FieldIssue[] = [];

  const { projectId } = request.data || {};
  if (!projectId) {
    issues.push({
      field: 'input',
      message: 'Missing required field: projectId',
    });
    return { success: false, issues };
  }

  try {
    const project = await ProjectService.getProjectById(projectId);
    if (!project) {
      return {
        success: false,
        issues: [{ field: 'projectId', message: 'Project not found' }],
      };
    }
    return { success: true, project };
  } catch (err: any) {
    logger.error('Project fetch failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
