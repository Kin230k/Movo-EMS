import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';


import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateCaller } from '../../../utils/authUtils';
import { UserProjectService } from '../../../models/project/user_project/user_project.service';

export interface UserProjectResult {
  success: boolean;
  issues?: FieldIssue[];
  data?: any;
}

export async function getAllUserProjectsHandler(): Promise<UserProjectResult> {
  const auth = await authenticateCaller({} as CallableRequest); // fake request since no input
  if (!auth.success) return auth;

  try {
    const records = await UserProjectService.getAllUserProjects();
    return { success: true, data: records };
  } catch (e: any) {
    logger.error(e);
    return { success: false, issues: parseDbError(e) };
  }
}
