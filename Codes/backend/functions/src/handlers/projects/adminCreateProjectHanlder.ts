import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../utils/types';
import { parseDbError } from '../../utils/dbErrorParser';

import { Multilingual } from '../../models/multilingual.type';
import { ProjectService } from '../../models/project/project/project.service';
import { authenticateAdmin } from '../../utils/authUtils';
export interface CreateProjectData {
  name: Multilingual;
  startingDate: string; // ISO date string
  badgeBackground?: string;
  endingDate: string;
  clientId: string;
  description?: Multilingual | null;
}

export async function adminCreateProjectHandler(
  request: CallableRequest<CreateProjectData>
) {
  const issues: FieldIssue[] = [];

  const auth = await authenticateAdmin(request);
  if (!auth.success) return auth;

  const {
    name,
    startingDate,
    badgeBackground,
    endingDate,
    description,
    clientId,
  } = request.data || {};
  if (!name || !startingDate || !clientId) {
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
