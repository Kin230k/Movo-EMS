import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateClient } from '../../../utils/authUtils';
import { LocationService } from '../../../models/project/location/location.service';
import { Location } from '../../../models/project/location/location.class';

export interface LocationResult {
  success: boolean;
  issues?: FieldIssue[];
  locations?: Location[];
}

// No parameters; infer client from auth
export async function getLocationsForClientHandler(
  request: CallableRequest
): Promise<LocationResult> {
  const auth = await authenticateClient(request);
  if (!auth.success) return auth;

  try {
    const locations = await LocationService.getLocationsByClient(
      auth.callerUuid
    );
    return { success: true, locations };
  } catch (dbErr: any) {
    logger.error('Get locations for client failed:', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }
}
