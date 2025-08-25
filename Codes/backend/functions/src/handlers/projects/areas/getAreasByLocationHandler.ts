import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { AreaService } from '../../../models/project/area/area.service';
import { Area } from '../../../models/project/area/area.class';
import { authenticateCaller } from '../../../utils/authUtils';

export interface AreaResult {
  success: boolean;
  issues?: FieldIssue[];
  areas?: Area[];
}

export async function getAreasByLocationHandler(request: CallableRequest<{ locationId: string }>): Promise<AreaResult> {
  const issues: FieldIssue[] = [];
  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  const { locationId } = request.data || {};
  if (!locationId) issues.push({ field: 'locationId', message: 'locationId is required' });
  if (issues.length > 0) return { success: false, issues };

  try {
    const areas = await AreaService.getAreasByLocation(locationId);
    return { success: true, areas };
  } catch (err: any) {
    logger.error('Get areas by location failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
