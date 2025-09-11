import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authorizeUserProjectAccessWorkerFirst } from '../../../utils/authUtils';
import { AttendanceService } from '../../../models/project/attendance/attendance.service';
import { AreaService } from '../../../models/project/area/area.service';
import { RoleService } from '../../../models/auth/role/role.service';

export interface CreateAttendanceData {
  signedWith: 'BARCODE' | 'MANUAL';
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
  const data = request.data || {};
  const { signedWith, userId, areaId } = data;

  // presence validation (no UUID format checks per your request)
  if (!signedWith)
    issues.push({ field: 'signedWith', message: 'signedWith is required' });
  if (!userId) issues.push({ field: 'userId', message: 'userId is required' });
  if (!areaId) issues.push({ field: 'areaId', message: 'areaId is required' });

  if (issues.length > 0) return { success: false, issues };
  let auth;
  try {
    const area = await AreaService.getAreaById(areaId);
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

    auth = await authorizeUserProjectAccessWorkerFirst(
      request,
      location.projectId!
    );
    if (!auth.success) {
      // normalize the failure to our CreateAttendanceResult shape
      return { success: false, issues: auth.issues };
    }

    // DT4: Authority Control for Attendance Modification
    // A3. Can Add Attendance => allowed for: Main User, Super Admin, Senior Supervisor
    const allowedCreateRoles = new Set([
      'Main User',
      'Super Admin',
      'Senior Supervisor',
    ]);
    const callerRole = await RoleService.getRoleByUserID(auth.callerUuid);

    // Clients are not permitted by DT4; only admins or users with allowed roles
    const isAllowedCreate =
      (auth as any).isAdmin === true ||
      (callerRole ? allowedCreateRoles.has(callerRole) : false);

    if (!isAllowedCreate) {
      return {
        success: false,
        issues: [
          {
            field: 'auth',
            message:
              'Forbidden: only Main User, Senior Supervisor, or Super Admin may add attendance',
          },
        ],
      };
    }
  } catch (err: any) {
    logger.error('createAttendanceHandler: authorization failure', err);
    return { success: false, issues: parseDbError(err) };
  }

  try {
    await AttendanceService.createAttendance(
      new Date().toISOString(),
      signedWith,
      auth.isAdmin ? '00000000-0000-0000-0000-000000000000' : auth.callerUuid,
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
