import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { AreaService } from '../../../models/project/area/area.service';
import { authenticateClient } from '../../../utils/authUtils';

export async function deleteAreaHandler(request: CallableRequest) {
  const issues: FieldIssue[] = [];
  const auth = await authenticateClient(request);
  if (!auth.success) return auth;

  const { areaId } = request.data || {};
  if (!areaId) {
    issues.push({ field: 'areaId', message: 'areaId is required' });
    return { success: false, issues };
  }

  try {
    await AreaService.deleteArea(areaId);
    return { success: true };
  } catch (err: any) {
    logger.error('Area deletion failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
