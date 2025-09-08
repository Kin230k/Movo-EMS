import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../utils/types';
import { parseDbError } from '../../utils/dbErrorParser';

import { Multilingual } from '../../models/multilingual.type';
import { ProjectService } from '../../models/project/project/project.service';
import { authenticateAdmin } from '../../utils/authUtils';

interface UpdateProjectData {
  projectId: string;
  name: Multilingual;
  startingDate: string;
  badgeBackground?: string;
  endingDate?: string;
  description?: Multilingual | null;
}

export async function updateProjectAsAdminHandler(
  request: CallableRequest<UpdateProjectData>
) {
  const issues: FieldIssue[] = [];

  const auth = await authenticateAdmin(request);
  if (!auth.success) return auth;

  const adminUserId = auth.callerUuid;
  const {
    projectId,
    name,
    startingDate,
    badgeBackground,
    endingDate,
    description,
  } = request.data || {};

  if (!projectId || !adminUserId || !name || !startingDate) {
    issues.push({
      field: 'input',
      message: 'Missing required fields: projectId, name, startingDate',
    });
    return { success: false, issues };
  }

  try {
    await ProjectService.updateProjectAsAdmin(
      projectId,
      adminUserId,
      name as Multilingual,
      startingDate,
      badgeBackground,
      endingDate,
      description as Multilingual | null
    );
    return { success: true };
  } catch (err: any) {
    logger.error('Admin project update failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
