import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { Multilingual } from '../../../models/multilingual.type';
import { AreaService } from '../../../models/project/area/area.service';
import { authenticateClient } from '../../../utils/authUtils';

interface UpdateAreaData {
  areaId: string;
  name: Multilingual;
  locationId: string;
}

export async function updateAreaHandler(request: CallableRequest<UpdateAreaData>) {
  const issues: FieldIssue[] = [];
  const auth = await authenticateClient(request);
  if (!auth.success) return auth;

  const { areaId, name, locationId } = request.data || {};
  if (!areaId || !name || !locationId) {
    issues.push({ field: 'input', message: 'Missing required fields: areaId, name, locationId' });
    return { success: false, issues };
  }

  try {
    await AreaService.updateArea(areaId, name as Multilingual, locationId);
    return { success: true };
  } catch (err: any) {
    logger.error('Area update failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}