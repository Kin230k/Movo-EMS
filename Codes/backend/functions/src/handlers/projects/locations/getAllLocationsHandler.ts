import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { authenticateCaller } from '../../../utils/authUtils';
import { LocationService } from '../../../models/project/location/location.service';
import { Location } from '../../../models/project/location/location.class';

export interface LocationResult {
  success: boolean;
  locations?: Location[];
}

export async function getAllLocationsHandler(
  request: CallableRequest
): Promise<LocationResult> {
  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  try {
    const locations = await LocationService.getAllLocations();
    return { success: true, locations };
  } catch (dbErr: any) {
    logger.error('Get all locations failed:', dbErr);
    return { success: false };
  }
}
