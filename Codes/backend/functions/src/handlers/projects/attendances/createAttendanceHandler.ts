import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateCaller } from '../../../utils/authUtils';
import { AttendanceService } from '../../../models/project/attendance/attendance.service';

export interface CreateAttendanceData {
  timestamp?: string | null;
  signedWith: 'QR_CODE' | 'MANUAL';
  signedBy: string;
  userId: string;
  areaId: string;
}

export interface CreateAttendanceResult {
  success: boolean;
  issues?: FieldIssue[];
}

export async function createAttendanceHandler(
  request: CallableRequest<CreateAttendanceData>
): Promise<CreateAttendanceResult> {
  const issues: FieldIssue[] = [];
  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  const { timestamp = null, signedWith, signedBy, userId, areaId } = request.data || {};

  // presence validation (no UUID format checks per your request)
  if (!signedWith) issues.push({ field: 'signedWith', message: 'signedWith is required' });
  if (!signedBy) issues.push({ field: 'signedBy', message: 'signedBy is required' });
  if (!userId) issues.push({ field: 'userId', message: 'userId is required' });
  if (!areaId) issues.push({ field: 'areaId', message: 'areaId is required' });

  // timestamp parse check (optional)
  if (timestamp !== null && timestamp !== undefined) {
    if (isNaN(Date.parse(String(timestamp)))) {
      issues.push({
        field: 'timestamp',
        message: 'timestamp must be a valid date/time string or omitted',
      });
    }
  }

  // business rules
  if (signedBy && userId) {
    if (signedWith === 'QR_CODE' && signedBy !== userId) {
      issues.push({ field: 'signedWith', message: 'QR_CODE sign-in must have signedBy = userId' });
    }
    if (signedWith === 'MANUAL' && signedBy === userId) {
      issues.push({ field: 'signedWith', message: 'MANUAL sign-in must have signedBy <> userId' });
    }
  }

  if (issues.length > 0) return { success: false, issues };

  try {
    await AttendanceService.createAttendance(
      timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
      signedWith,
      signedBy,
      userId,
      areaId
    );
    return { success: true };
  } catch (dbErr: any) {
    logger.error('Attendance creation DB write failed:', dbErr);
    const dbIssues = parseDbError(dbErr);
    return { success: false, issues: dbIssues };
  }
}
