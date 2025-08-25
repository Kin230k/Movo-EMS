import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { AreaService } from '../../../models/project/area/area.service';
import { Area } from '../../../models/project/area/area.class';
import { authenticateCaller } from '../../../utils/authUtils';

export interface AreaResult {
  success: boolean;
  areas?: Area[];
}

export async function getAllAreasHandler(request: CallableRequest): Promise<AreaResult> {
  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  try {
    const areas = await AreaService.getAllAreas();
    return { success: true, areas };
  } catch (err: any) {
    logger.error('Get all areas failed', err);
    return { success: false };
  }
}
