import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { Multilingual } from '../../../models/multilingual.type';
import { LocationService } from '../../../models/project/location/location.service';
import { authenticateClient } from '../../../utils/authUtils';

export async function createLocationHandler(request: CallableRequest) {
  const issues: FieldIssue[] = [];

  const auth = await authenticateClient(request);
  if (!auth.success) return auth;

  const { clientId, name, projectId, siteMap, longitude, latitude } = request.data || {};

  if (!clientId || !name || !projectId || longitude == null || latitude == null) {
    issues.push({
      field: 'input',
      message: 'Missing required fields: clientId, name, projectId, longitude, latitude',
    });
    return { success: false, issues };
  }

  try {
    await LocationService.createLocation(name as Multilingual, projectId, siteMap, longitude, latitude);
    return { success: true };
  } catch (err: any) {
    logger.error('Location creation failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
