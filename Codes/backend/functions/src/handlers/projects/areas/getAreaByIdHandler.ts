import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { AreaService } from '../../../models/project/area/area.service';
import { Area } from '../../../models/project/area/area.class';
import { authenticateCaller } from '../../../utils/authUtils';

export interface LocationResult {
  success: boolean;
  issues?: FieldIssue[];
  area?: Area | null;
}

export async function getAreaByIdHandler(request: CallableRequest<{ areaId: string }>): Promise<LocationResult> {
  const issues: FieldIssue[] = [];
  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  const { areaId } = request.data || {};
  if (!areaId) issues.push({ field: 'areaId', message: 'areaId is required' });
  if (issues.length > 0) return { success: false, issues };

  try {
    const area = await AreaService.getAreaById(areaId);
    return { success: true, area };
  } catch (err: any) {
    logger.error('Get area by ID failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
