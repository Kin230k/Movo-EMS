import * as logger from 'firebase-functions/logger';
import { parseDbError } from '../../utils/dbErrorParser';
import { ProjectService } from '../../models/project/project/project.service';

export async function getAllProjectsHandler() {
  try {
    const projects = await ProjectService.getAllProjects();
    return { success: true, projects };
  } catch (err: any) {
    logger.error('Fetching all projects failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
