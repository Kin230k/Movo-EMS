import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateCaller } from '../../../utils/authUtils';
import { LocationService } from '../../../models/project/location/location.service';
import { Location } from '../../../models/project/location/location.class';

export interface GetLocationByIdData {
  locationId: string;
}

export interface LocationResult {
  success: boolean;
  issues?: FieldIssue[];
  location?: Location | null;
}

export async function getLocationByIdHandler(
  request: CallableRequest<GetLocationByIdData>
): Promise<LocationResult> {
  const issues: FieldIssue[] = [];
  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  const { locationId } = request.data || {};
  if (!locationId) issues.push({ field: 'locationId', message: 'locationId is required' });

  if (issues.length > 0) return { success: false, issues };

  try {
    const location = await LocationService.getLocationById(locationId);
    return { success: true, location };
  } catch (dbErr: any) {
    logger.error('Get location by ID failed:', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }
}
