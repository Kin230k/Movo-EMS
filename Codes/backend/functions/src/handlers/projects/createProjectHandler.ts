import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../utils/types';
import { parseDbError } from '../../utils/dbErrorParser';

import { Multilingual } from '../../models/multilingual.type';
import { ProjectService } from '../../models/project/project/project.service';
import { authenticateClient } from '../../utils/authUtils';
export interface CreateProjectData {
  name: Multilingual;
  startingDate: string; // ISO date string
  badgeBackground?: string;
  endingDate: string;
  description?: Multilingual | null;
}

export async function createProjectHandler(request: CallableRequest<CreateProjectData>) {
  const issues: FieldIssue[] = [];

  const auth = await authenticateClient(request);
  if (!auth.success) return auth;

  const {
    name,
    startingDate,
    badgeBackground,
    endingDate,
    description,
  } = request.data || {};
  if ( !name || !startingDate) {
    issues.push({
      field: 'input',
      message: 'Missing required fields: clientId, name, startingDate',
    });
    return { success: false, issues };
  }

  try {
    await ProjectService.createProject(
      auth.callerUuid,
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
