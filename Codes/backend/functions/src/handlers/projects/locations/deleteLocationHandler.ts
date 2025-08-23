import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateCaller } from '../../../utils/authUtils';
import { LocationService } from '../../../models/project/location/location.service';

export interface DeleteLocationData {
  locationId: string;
}

export interface LocationResult {
  success: boolean;
  issues?: FieldIssue[];
}

export async function deleteLocationHandler(
  request: CallableRequest<DeleteLocationData>
): Promise<LocationResult> {
  const issues: FieldIssue[] = [];
  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  const { locationId } = request.data || {};
  if (!locationId) issues.push({ field: 'locationId', message: 'locationId is required' });

  if (issues.length > 0) return { success: false, issues };

  try {
    await LocationService.deleteLocation(locationId);
    return { success: true };
  } catch (dbErr: any) {
    logger.error('Delete location failed:', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }
}
