import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authorizeUserProjectAccessWorkerFirst } from '../../../utils/authUtils';
import { AttendanceService } from '../../../models/project/attendance/attendance.service';
import { AreaService } from '../../../models/project/area/area.service';
import { RoleService } from '../../../models/auth/role/role.service';

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
  const { attendanceId } = request.data || {};

  if (!attendanceId)
    issues.push({ field: 'attendanceId', message: 'attendanceId is required' });

  if (issues.length > 0) return { success: false, issues };

  try {
    // fetch attendance to determine its user/project for authorization
    const attendance = await AttendanceService.getAttendanceById(attendanceId);
    if (!attendance) {
      return {
        success: false,
        issues: [{ field: 'attendanceId', message: 'Attendance not found' }],
      };
    }

    const area = await AreaService.getAreaById(attendance.areaId);
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
    // authorize: user_project -> client -> admin
    const auth = await authorizeUserProjectAccessWorkerFirst(
      request,
      location.projectId!
    );
    if (!auth.success) {
      return { success: false, issues: auth.issues };
    }

    // DT4: Authority Control for Attendance Modification
    // A2. Can Delete Attendance => allowed for: Main User, Super Admin, Senior Supervisor
    const allowedDeleteRoles = new Set([
      'Main User',
      'Super Admin',
      'Senior Supervisor',
    ]);
    const callerRole = await RoleService.getRoleByUserID(auth.callerUuid);
    const isAllowedDelete =
      (auth as any).isAdmin === true ||
      (callerRole ? allowedDeleteRoles.has(callerRole) : false);

    if (!isAllowedDelete) {
      return {
        success: false,
        issues: [
          {
            field: 'auth',
            message:
              'Forbidden: only Main User, Senior Supervisor, or Super Admin may delete attendance',
          },
        ],
      };
    }

    await AttendanceService.deleteAttendance(attendanceId);
    return { success: true };
  } catch (dbErr: any) {
    logger.error('Attendance delete DB write failed:', dbErr);
    const dbIssues = parseDbError(dbErr);
    return { success: false, issues: dbIssues };
  }
}
