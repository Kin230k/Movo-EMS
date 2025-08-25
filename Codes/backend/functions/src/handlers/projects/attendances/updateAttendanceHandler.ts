import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authorizeUserProjectAccessWorkerFirst } from '../../../utils/authUtils';
import { AttendanceService } from '../../../models/project/attendance/attendance.service';
import { AreaService } from '../../../models/project/area/area.service';

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
  const { attendanceId, timestamp, signedWith, signedBy, userId, areaId } =
    request.data || {};

  // Presence validation
  if (!attendanceId) issues.push({ field: 'attendanceId', message: 'attendanceId is required' });
  if (!areaId) issues.push({ field: 'areaId', message: 'areaId is required' });

  // Timestamp parse if provided
  if (timestamp !== null && timestamp !== undefined && isNaN(Date.parse(String(timestamp)))) {
    issues.push({ field: 'timestamp', message: 'timestamp must be a valid date/time if provided' });
  }

  // Business rules only when enough data provided
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
    // Authorization - moved after validation but before the update operation
    const area = await AreaService.getAreaById(areaId!);
    if (!area) {
      return { success: false, issues: [{ field: 'areaId', message: 'Area not found' }] };
    }

    const location = await area.location();
    if (!location) {
      return { success: false, issues: [{ field: 'areaId', message: 'Area has no valid location' }] };
    }
    
    const auth = await authorizeUserProjectAccessWorkerFirst(request, location.projectId);
    if (!auth.success) {
      return { success: false, issues: auth.issues };
    }

    // Proceed with the update
    await AttendanceService.updateAttendance(
      attendanceId,
      timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
      signedWith!,
      signedBy!,
      userId!,
      areaId!
    );
    
    return { success: true };
  } catch (err: any) {
    logger.error('Attendance update failed:', err);
    return { success: false, issues: parseDbError(err) };
  }
}