import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateCaller } from '../../../utils/authUtils';
import { AttendanceService } from '../../../models/project/attendance/attendance.service';

export interface DeleteAttendanceData {
  attendanceId: string;
}
export interface DeleteAttendanceResult {
  success: boolean;
  issues?: FieldIssue[];
}

export async function deleteAttendanceHandler(
  request: CallableRequest<DeleteAttendanceData>
): Promise<DeleteAttendanceResult> {
  const issues: FieldIssue[] = [];
  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  const { attendanceId } = request.data || {};
  if (!attendanceId) issues.push({ field: 'attendanceId', message: 'attendanceId is required' });

  if (issues.length > 0) return { success: false, issues };

  try {
    await AttendanceService.deleteAttendance(attendanceId);
    return { success: true };
  } catch (dbErr: any) {
    logger.error('Attendance delete DB write failed:', dbErr);
    const dbIssues = parseDbError(dbErr);
    return { success: false, issues: dbIssues };
  }
}
