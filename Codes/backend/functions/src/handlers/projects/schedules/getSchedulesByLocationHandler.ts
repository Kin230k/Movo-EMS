import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateCaller } from '../../../utils/authUtils';
import { ScheduleService } from '../../../models/project/schedule/schedule.service';
import { Schedule } from '../../../models/project/schedule/schedule.class';

export interface GetSchedulesByLocationData {
  locationId: string;
}

export interface GetSchedulesByLocationResult {
  success: boolean;
  schedules?: Schedule[];
  issues?: FieldIssue[];
}

export async function getSchedulesByLocationHandler(
  request: CallableRequest<GetSchedulesByLocationData>
): Promise<GetSchedulesByLocationResult> {
  const issues: FieldIssue[] = [];
  const auth = await authenticateCaller(request);
  if (!auth.success) return { success: false, issues: auth.issues || [] };

  const { locationId } = request.data || {};

  // Basic required field
  if (!locationId)
    issues.push({ field: 'locationId', message: 'locationId is required' });

  if (issues.length > 0) return { success: false, issues };

  try {
    const schedules = await ScheduleService.getSchedulesByLocation(locationId);
    return { success: true, schedules };
  } catch (dbErr: any) {
    logger.error('Schedules retrieval by location failed:', dbErr);
    const dbIssues = parseDbError(dbErr);
    return { success: false, issues: dbIssues };
  }
}
