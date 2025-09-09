import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authorizeUserProjectAccessWorkerFirst } from '../../../utils/authUtils';
import { AttendanceService } from '../../../models/project/attendance/attendance.service';
import { AreaService } from '../../../models/project/area/area.service';
import { RoleService } from '../../../models/auth/role/role.service';

export interface UpdateAttendanceData {
  attendanceId: string;
  timestamp?: string | null;
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
  const { attendanceId, timestamp, userId, areaId } = request.data || {};

  // Presence validation
  if (!attendanceId)
    issues.push({ field: 'attendanceId', message: 'attendanceId is required' });
  if (!areaId) issues.push({ field: 'areaId', message: 'areaId is required' });

  // Timestamp parse if provided
  if (
    timestamp !== null &&
    timestamp !== undefined &&
    isNaN(Date.parse(String(timestamp)))
  ) {
    issues.push({
      field: 'timestamp',
      message: 'timestamp must be a valid date/time if provided',
    });
  }

  if (issues.length > 0) return { success: false, issues };

  try {
    // Authorization - moved after validation but before the update operation
    const area = await AreaService.getAreaById(areaId!);
    if (!area) {
      return {
        success: false,
        issues: [{ field: 'areaId', message: 'Area not found' }],
      };
    }

    const location = await area.location();
    if (!location) {
      return {
        success: false,
        issues: [{ field: 'areaId', message: 'Area has no valid location' }],
      };
    }
    const attendance = await AttendanceService.getAttendanceById(attendanceId);
    if (!attendance) {
      return {
        success: false,
        issues: [
          { field: 'attendance', message: 'No Attendance Found with that Id' },
        ],
      };
    }

    const auth = await authorizeUserProjectAccessWorkerFirst(
      request,
      location.projectId!
    );
    if (!auth.success) {
      return { success: false, issues: auth.issues };
    }

    // DT4: Authority Control for Attendance Modification
    // A1. Can Modify Attendance => allowed for: Main User, Super Admin
    const allowedUpdateRoles = new Set(['Main User', 'Super Admin']);
    const callerRole = await RoleService.getRoleByUserID(auth.callerUuid);
    const isAllowedUpdate =
      (auth as any).isAdmin === true ||
      (callerRole ? allowedUpdateRoles.has(callerRole) : false);

    if (!isAllowedUpdate) {
      return {
        success: false,
        issues: [
          {
            field: 'auth',
            message:
              'Forbidden: only Main User or Super Admin may modify attendance',
          },
        ],
      };
    }

    // Proceed with the update
    await AttendanceService.updateAttendance(
      attendanceId,
      timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
      attendance.signedWith!,
      attendance.signedBy!,
      userId!,
      areaId!
    );

    return { success: true };
  } catch (err: any) {
    logger.error('Attendance update failed:', err);
    return { success: false, issues: parseDbError(err) };
  }
}
