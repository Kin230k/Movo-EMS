import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';


import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateCaller } from '../../../utils/authUtils';
import { AttendanceService } from '../../../models/project/attendance/attendance.service';

export interface GetAttendancesByUserData {
  userId: string;
}
export interface GetAttendancesByUserResult {
  success: boolean;
  data?: any[];
  issues?: FieldIssue[];
}

export async function getAttendancesByUserHandler(
  request: CallableRequest<GetAttendancesByUserData>
): Promise<GetAttendancesByUserResult> {
  const issues: FieldIssue[] = [];
  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  const { userId } = request.data || {};
  if (!userId) issues.push({ field: 'userId', message: 'userId is required' });

  if (issues.length > 0) return { success: false, issues };

  try {
    const attendance = await AttendanceService.getAttendancesByUser(userId);
    return { success: true, data: attendance };
  } catch (dbErr: any) {
    logger.error('Get attendances by user failed:', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }
}
