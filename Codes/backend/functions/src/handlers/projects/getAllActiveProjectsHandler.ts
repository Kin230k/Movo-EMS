import * as logger from 'firebase-functions/logger';
import { parseDbError } from '../../utils/dbErrorParser';
import { ProjectService } from '../../models/project/project/project.service';
import { CallableRequest } from 'firebase-functions/https';

export async function getAllActiveProjectsHandler(request: CallableRequest) {
  try {
    const projects = await ProjectService.getAllActiveProjects();
    return { success: true, projects };
  } catch (err: any) {
    logger.error('Fetching all projects failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
