import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateCaller } from '../../../utils/authUtils';
import { AttendanceService } from '../../../models/project/attendance/attendance.service';

export interface GetAttendanceByIdData {
  attendanceId: string;
}
export interface GetAttendanceByIdResult {
  success: boolean;
  data?: any | null;
  issues?: FieldIssue[];
}

export async function getAttendanceByIdHandler(
  request: CallableRequest<GetAttendanceByIdData>
): Promise<GetAttendanceByIdResult> {
  const issues: FieldIssue[] = [];
  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  const { attendanceId } = request.data || {};
  if (!attendanceId) issues.push({ field: 'attendanceId', message: 'attendanceId is required' });

  if (issues.length > 0) return { success: false, issues };

  try {
    const attendance = await AttendanceService.getAttendanceById(attendanceId);
    return { success: true, data: attendance ?? null };
  } catch (dbErr: any) {
    logger.error('Get attendance by id failed:', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }
}
