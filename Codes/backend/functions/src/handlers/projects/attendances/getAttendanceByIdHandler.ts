import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authorizeUserProjectAccessWorkerFirst } from '../../../utils/authUtils';
import { AttendanceService } from '../../../models/project/attendance/attendance.service';
import { AreaService } from '../../../models/project/area/area.service';

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
  const { attendanceId } = request.data || {};

  if (!attendanceId)
    issues.push({ field: 'attendanceId', message: 'attendanceId is required' });

  if (issues.length > 0) return { success: false, issues };

  try {
    // Fetch attendance to determine its project for authorization
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

    // Authorize user access to the project
    const auth = await authorizeUserProjectAccessWorkerFirst(
      request,
      location.projectId!
    );
    if (!auth.success) {
      return { success: false, issues: auth.issues };
    }

    return { success: true, data: attendance };
  } catch (dbErr: any) {
    logger.error('Get attendance by id failed:', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }
}
