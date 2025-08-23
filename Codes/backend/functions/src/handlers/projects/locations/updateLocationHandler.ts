import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateCaller } from '../../../utils/authUtils';
import { LocationService } from '../../../models/project/location/location.service';
import { Multilingual } from '../../../models/multilingual.type';

export interface UpdateLocationData {
  locationId: string;
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

export async function updateLocationHandler(
  request: CallableRequest<UpdateLocationData>
): Promise<LocationResult> {
  const issues: FieldIssue[] = [];
  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  const { locationId, name, projectId, siteMap, longitude, latitude } = request.data || {};

  if (!locationId) issues.push({ field: 'locationId', message: 'locationId is required' });
  if (!name) issues.push({ field: 'name', message: 'name is required' });
  if (!projectId) issues.push({ field: 'projectId', message: 'projectId is required' });

  if (issues.length > 0) return { success: false, issues };

  try {
    await LocationService.updateLocation(locationId, name, projectId, siteMap, longitude, latitude);
    return { success: true };
  } catch (dbErr: any) {
    logger.error('Location update failed:', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }
}
