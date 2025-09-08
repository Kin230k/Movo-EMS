import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateCaller } from '../../../utils/authUtils';
import { ScheduleService } from '../../../models/project/schedule/schedule.service';

export interface DeleteScheduleData {
  scheduleId: string;
}

export interface DeleteScheduleResult {
  success: boolean;
  issues?: FieldIssue[];
}

export async function deleteScheduleHandler(
  request: CallableRequest<DeleteScheduleData>
): Promise<DeleteScheduleResult> {
  const issues: FieldIssue[] = [];
  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  const { scheduleId } = request.data || {};

  // Basic required field
  if (!scheduleId) issues.push({ field: 'scheduleId', message: 'scheduleId is required' });

  if (issues.length > 0) return { success: false, issues };

  try {
    await ScheduleService.deleteSchedule(scheduleId);
    return { success: true };
  } catch (dbErr: any) {
    logger.error('Schedule deletion DB write failed:', dbErr);
    const dbIssues = parseDbError(dbErr);
    return { success: false, issues: dbIssues };
  }
}