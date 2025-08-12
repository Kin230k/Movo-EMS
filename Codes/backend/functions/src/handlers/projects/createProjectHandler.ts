import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../utils/types';
import { parseDbError } from '../../utils/dbErrorParser';

import { Multilingual } from '../../models/multilingual.type';
import { ProjectService } from '../../models/project/project/project.service';

export async function createProjectHandler(request: CallableRequest) {
  const issues: FieldIssue[] = [];

  if (!request.auth?.uid) {
    issues.push({ field: 'auth', message: 'Must be signed in' });
    return { success: false, issues };
  }

  const {
    clientId,
    name,
    startingDate,
    badgeBackground,
    endingDate,
    description,
  } = request.data || {};
  if (!clientId || !name || !startingDate) {
    issues.push({
      field: 'input',
      message: 'Missing required fields: clientId, name, startingDate',
    });
    return { success: false, issues };
  }

  try {
    await ProjectService.createProject(
      clientId,
      name as Multilingual,
      startingDate,
      badgeBackground,
      endingDate,
      description as Multilingual | null
    );
    return { success: true };
  } catch (err: any) {
    logger.error('Project creation failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
