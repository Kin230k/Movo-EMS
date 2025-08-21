import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateCaller } from '../../../utils/authUtils';
import { AttendanceService } from '../../../models/project/attendance/attendance.service';

export interface UpdateAttendanceData {
  attendanceId: string;
  signedWith: 'QR_CODE' | 'MANUAL';
  timestamp?: string | null;
  signedBy?: string | null;
  userId?: string | null;
  areaId?: string | null;
}

export interface UpdateAttendanceResult {
  success: boolean;
  issues?: FieldIssue[];
}

export async function updateAttendanceHandler(
  request: CallableRequest<UpdateAttendanceData>
): Promise<UpdateAttendanceResult> {
  const issues: FieldIssue[] = [];
  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  const { attendanceId, timestamp , signedWith , signedBy , userId , areaId  } =
    request.data || {};

  // presence
  if (!attendanceId) issues.push({ field: 'attendanceId', message: 'attendanceId is required' });
  if (!areaId) issues.push({ field: 'areaId', message: 'areaId is required' });

  // timestamp parse if provided
  if (timestamp !== null && timestamp !== undefined && isNaN(Date.parse(String(timestamp)))) {
    issues.push({ field: 'timestamp', message: 'timestamp must be a valid date/time if provided' });
  }

  // business rules only when enough data provided
  if (signedWith !== null && signedBy !== null && userId !== null) {
    if (signedWith === 'QR_CODE' && signedBy !== userId) {
      issues.push({ field: 'signedWith', message: 'QR_CODE sign-in must have signedBy = userId' });
    }
    if (signedWith === 'MANUAL' && signedBy === userId) {
      issues.push({ field: 'signedWith', message: 'MANUAL sign-in must have signedBy <> userId' });
    }
  }

  if (issues.length > 0) return { success: false, issues };

  try {
    await AttendanceService.updateAttendance(
      attendanceId,
      timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
      signedWith!, // can be null
      signedBy!,
      userId!,
      areaId!
    );
    return { success: true };
  } catch (dbErr: any) {
    logger.error('Attendance update DB write failed:', dbErr);
    const dbIssues = parseDbError(dbErr);
    return { success: false, issues: dbIssues };
  }
}
