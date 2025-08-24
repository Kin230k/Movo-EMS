import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { LocationService } from '../../../models/project/location/location.service';
import { authenticateClient } from '../../../utils/authUtils';

export interface DeleteLocationData {
  clientId: string;
  locationId: string;
}

export async function deleteLocationHandler(request: CallableRequest<DeleteLocationData>) {
  const issues: FieldIssue[] = [];

  const auth = await authenticateClient(request);
  if (!auth.success) return auth;

  const { clientId, locationId } = request.data || {};

  if (!clientId || !locationId) {
    issues.push({
      field: 'input',
      message: 'Missing required fields: clientId, locationId',
    });
    return { success: false, issues };
  }

  try {
    await LocationService.deleteLocation(locationId);
    return { success: true };
  } catch (err: any) {
    logger.error('Location deletion failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}