import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateCaller } from '../../../utils/authUtils';
import { LocationService } from '../../../models/project/location/location.service';
import { Multilingual } from '../../../models/multilingual.type';

export interface CreateLocationData {
  name: Multilingual;
  projectId: string;
  siteMap?: string;
  longitude?: number;
  latitude?: number;
}

export interface LocationResult {
  success: boolean;
  issues?: FieldIssue[];
}

export async function createLocationHandler(
  request: CallableRequest<CreateLocationData>
): Promise<LocationResult> {
  const issues: FieldIssue[] = [];
  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  const { name, projectId, siteMap, longitude, latitude } = request.data || {};

  if (!name) issues.push({ field: 'name', message: 'name is required' });
  if (!projectId) issues.push({ field: 'projectId', message: 'projectId is required' });
  if (longitude == null) issues.push({ field: 'longitude', message: 'longitude is required' });
  if (latitude == null) issues.push({ field: 'latitude', message: 'latitude is required' });

  if (issues.length > 0) return { success: false, issues };

  try {
    await LocationService.createLocation(name, projectId, siteMap, longitude, latitude);
    return { success: true };
  } catch (dbErr: any) {
    logger.error('Location creation failed:', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }
}
