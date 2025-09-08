import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authorizeUserProjectAccessWorkerFirst } from '../../../utils/authUtils';
import { AttendanceService } from '../../../models/project/attendance/attendance.service';

export interface GetAttendancesByUserData {
  userId: string;
  projectId: string; // Add projectId to the interface
}
export interface GetAttendancesByUserResult {
  success: boolean;
  data?: any[];
  issues?: FieldIssue[];
}

export async function getAttendancesByUserHandler(
  request: CallableRequest<GetAttendancesByUserData>
): Promise<GetAttendancesByUserResult> {
  const issues: FieldIssue[] = [];
  const { userId, projectId } = request.data || {};

  if (!userId) issues.push({ field: 'userId', message: 'userId is required' });
  if (!projectId) issues.push({ field: 'projectId', message: 'projectId is required' });

  if (issues.length > 0) return { success: false, issues };

  try {
    // Authorize user access to the project
    const auth = await authorizeUserProjectAccessWorkerFirst(request, projectId);
    if (!auth.success) {
      return { success: false, issues: auth.issues };
    }

    const attendances = await AttendanceService.getAttendancesByUser(userId);
    
    // Filter attendances to only include those from the authorized project
    
    
    
    return { success: true, data: attendances };
  } catch (dbErr: any) {
    logger.error('Get attendances by user failed:', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }
}