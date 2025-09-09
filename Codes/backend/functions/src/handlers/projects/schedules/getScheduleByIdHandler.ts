import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateCaller } from '../../../utils/authUtils';
import { ScheduleService } from '../../../models/project/schedule/schedule.service';
import { Schedule } from '../../../models/project/schedule/schedule.class';

export interface GetScheduleByIdData {
  scheduleId: string;
}

export interface GetScheduleByIdResult {
  success: boolean;
  schedule?: Schedule;
  issues?: FieldIssue[];
}

export async function getScheduleByIdHandler(
  request: CallableRequest<GetScheduleByIdData>
): Promise<GetScheduleByIdResult> {
  const issues: FieldIssue[] = [];
  const auth = await authenticateCaller(request);
  if (!auth.success) return { success: false, issues: auth.issues || [] };

  const { scheduleId } = request.data || {};

  // Basic required field
  if (!scheduleId) issues.push({ field: 'scheduleId', message: 'scheduleId is required' });

  if (issues.length > 0) return { success: false, issues };

  try {
    const schedule = await ScheduleService.getScheduleById(scheduleId);
    if (!schedule) {
      issues.push({ field: 'scheduleId', message: 'Schedule not found' });
      return { success: false, issues };
    }
    
    return { success: true, schedule };
  } catch (dbErr: any) {
    logger.error('Schedule retrieval failed:', dbErr);
    const dbIssues = parseDbError(dbErr);
    return { success: false, issues: dbIssues };
  }
}