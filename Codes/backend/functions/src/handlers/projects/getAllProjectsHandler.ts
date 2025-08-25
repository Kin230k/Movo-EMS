import * as logger from 'firebase-functions/logger';
import { parseDbError } from '../../utils/dbErrorParser';
import { ProjectService } from '../../models/project/project/project.service';
import { authenticateAdmin } from '../../utils/authUtils';
import { CallableRequest } from 'firebase-functions/https';

export async function getAllProjectsHandler(request: CallableRequest) {
  const auth = await authenticateAdmin(request);
  if (!auth.success) return auth;
  try {
    const projects = await ProjectService.getAllProjects();
    return { success: true, projects };
  } catch (err: any) {
    logger.error('Fetching all projects failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
