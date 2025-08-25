import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authorizeUserProjectAccessWorkerFirst } from '../../../utils/authUtils';
import { AttendanceService } from '../../../models/project/attendance/attendance.service';

export interface GetAttendancesByProjectData {
  projectId: string;
}

export interface GetAttendancesByProjectResult {
  success: boolean;
  data?: any[];
  issues?: FieldIssue[];
}

export async function getAttendancesByProjectHandler(
  request: CallableRequest<GetAttendancesByProjectData>
): Promise<GetAttendancesByProjectResult> {
  const issues: FieldIssue[] = [];
  const { projectId } = request.data || {};

  if (!projectId) issues.push({ field: 'projectId', message: 'projectId is required' });

  if (issues.length > 0) return { success: false, issues };

  try {
    const auth = await authorizeUserProjectAccessWorkerFirst(request, projectId);
    if (!auth.success) {
      return { success: false, issues: auth.issues };
    }

    const attendances = await AttendanceService.getAttendancesByProject(projectId);
    return { success: true, data: attendances };
  } catch (dbErr: any) {
    logger.error('Get attendances by project failed:', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }
}