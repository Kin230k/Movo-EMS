import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { Multilingual } from '../../../models/multilingual.type';
import { LocationService } from '../../../models/project/location/location.service';
import { authenticateClient } from '../../../utils/authUtils';

export interface UpdateLocationData {
  
  locationId: string;
  name: Multilingual;
  projectId: string;
  siteMap?: string;
  longitude?: number;
  latitude?: number;
}

export async function updateLocationHandler(request: CallableRequest<UpdateLocationData>) {
  const issues: FieldIssue[] = [];

  const auth = await authenticateClient(request);
  if (!auth.success) return auth;

  const {  locationId, name, projectId, siteMap, longitude, latitude } = request.data || {};

  if ( !locationId || !name || !projectId) {
    issues.push({
      field: 'input',
      message: 'Missing required fields: clientId, locationId, name, projectId',
    });
    return { success: false, issues };
  }

  try {
    await LocationService.updateLocation(locationId, name as Multilingual, projectId, siteMap, longitude, latitude);
    return { success: true };
  } catch (err: any) {
    logger.error('Location update failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}