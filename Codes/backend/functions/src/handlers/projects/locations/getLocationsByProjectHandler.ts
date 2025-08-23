import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateCaller } from '../../../utils/authUtils';
import { LocationService } from '../../../models/project/location/location.service';
import { Location } from '../../../models/project/location/location.class';

export interface GetLocationsByProjectData {
  projectId: string;
}

export interface LocationResult {
  success: boolean;
  issues?: FieldIssue[];
  locations?: Location[];
}

export async function getLocationsByProjectHandler(
  request: CallableRequest<GetLocationsByProjectData>
): Promise<LocationResult> {
  const issues: FieldIssue[] = [];
  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  const { projectId } = request.data || {};
  if (!projectId) issues.push({ field: 'projectId', message: 'projectId is required' });

  if (issues.length > 0) return { success: false, issues };

  try {
    const locations = await LocationService.getLocationsByProject(projectId);
    return { success: true, locations };
  } catch (dbErr: any) {
    logger.error('Get locations by project failed:', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }
}
