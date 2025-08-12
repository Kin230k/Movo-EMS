import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../utils/types';
import { parseDbError } from '../../utils/dbErrorParser';

import { Multilingual } from '../../models/multilingual.type';
import { ProjectService } from '../../models/project/project/project.service';

export async function updateProjectHandler(request: CallableRequest) {
  const issues: FieldIssue[] = [];

  if (!request.auth?.uid) {
    issues.push({ field: 'auth', message: 'Must be signed in' });
    return { success: false, issues };
  }

  const {
    projectId,
    clientId,
    name,
    startingDate,
    badgeBackground,
    endingDate,
    description,
  } = request.data || {};
  if (!projectId || !clientId || !name || !startingDate) {
    issues.push({
      field: 'input',
      message:
        'Missing required fields: projectId, clientId, name, startingDate',
    });
    return { success: false, issues };
  }

  try {
    await ProjectService.updateProject(
      projectId,
      clientId,
      name as Multilingual,
      startingDate,
      badgeBackground,
      endingDate,
      description as Multilingual | null
    );
    return { success: true };
  } catch (err: any) {
    logger.error('Project update failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
