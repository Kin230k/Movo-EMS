import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateCaller } from '../../../utils/authUtils';
import { ScheduleService } from '../../../models/project/schedule/schedule.service';
import { Schedule } from '../../../models/project/schedule/schedule.class';

export interface GetAllSchedulesResult {
  success: boolean;
  schedules?: Schedule[];
  issues?: FieldIssue[];
}

export async function getAllSchedulesHandler(
  request: CallableRequest
): Promise<GetAllSchedulesResult> {
  const auth = await authenticateCaller(request);
  if (!auth.success) return { success: false, issues: auth.issues || [] };

  try {
    const schedules = await ScheduleService.getAllSchedules();
    return { success: true, schedules };
  } catch (dbErr: any) {
    logger.error('Schedules retrieval failed:', dbErr);
    const dbIssues = parseDbError(dbErr);
    return { success: false, issues: dbIssues };
  }
}