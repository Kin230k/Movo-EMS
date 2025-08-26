import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../utils/types';
import { parseDbError } from '../../utils/dbErrorParser';
import { authenticateClient } from '../../utils/authUtils';
import { ProjectService } from '../../models/project/project/project.service';
import { Project } from '../../models/project/project/project.class';

export interface GetProjectByClientData {
  clientId: string;
}

export interface GetProjectByClientResult {
  success: boolean;
  data?: Project | null;
  issues?: FieldIssue[];
}

export async function getProjectByClientHandler(
  request: CallableRequest<GetProjectByClientData>
): Promise<GetProjectByClientResult> {
  const issues: FieldIssue[] = [];
  const { clientId } = request.data || {};

  if (!clientId) {
    issues.push({ field: 'clientId', message: 'clientId is required' });
    return { success: false, issues };
  }

  try {
    // Authenticate as client
    const auth = await authenticateClient(request);
    if (!auth.success) {
      return { success: false, issues: auth.issues };
    }

    // Ensure authenticated client is only accessing its own data
    if (auth.callerUuid !== clientId) {
      logger.warn('getProjectByClient: client tried to access another client project', {
        callerUuid: auth.callerUuid,
        requested: clientId,
      });
      return {
        success: false,
        issues: [
          { field: 'auth', message: 'Forbidden: clients can only access their own projects' },
        ],
      };
    }

    const project = await ProjectService.getProjectByClient(clientId);
    return { success: true, data: project };
  } catch (dbErr: any) {
    logger.error('getProjectByClient failed:', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }
}
