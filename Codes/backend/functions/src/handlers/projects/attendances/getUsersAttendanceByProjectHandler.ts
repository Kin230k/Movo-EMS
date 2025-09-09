import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authorizeUserProjectAccessWorkerFirst } from '../../../utils/authUtils';
import { AttendanceService } from '../../../models/project/attendance/attendance.service';
import { UserAttendance } from '../../../models/project/attendance/attendance.mapper';

export interface GetUserAttendancesByProjectData {
  projectId: string;
}

export interface GetUserAttendancesByProjectResult {
  success: boolean;
  data?: UserAttendance[];
  issues?: FieldIssue[];
}

export async function getUserAttendancesByProjectHandler(
  request: CallableRequest<GetUserAttendancesByProjectData>
): Promise<GetUserAttendancesByProjectResult> {
  const issues: FieldIssue[] = [];
  const { projectId } = request.data || {};

  if (!projectId) {
    issues.push({ field: 'projectId', message: 'projectId is required' });
  }

  if (issues.length > 0) {
    return { success: false, issues };
  }

  try {
    const auth = await authorizeUserProjectAccessWorkerFirst(request, projectId);
    if (!auth.success) {
      return { success: false, issues: auth.issues };
    }

    const userAttendances = await AttendanceService.getUsersAttendanceByProject(projectId);
    return { success: true, data: userAttendances };
  } catch (dbErr: any) {
    logger.error('Get user attendances by project failed:', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }
}