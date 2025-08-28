import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authorizeUserProjectAccessWorkerFirst } from '../../../utils/authUtils';
import { AttendanceService } from '../../../models/project/attendance/attendance.service';
import { AreaService } from '../../../models/project/area/area.service';

export interface CreateAttendanceData {
  timestamp?: string | null;
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
  const { timestamp = null, signedWith,  userId, areaId } = data;

  // presence validation (no UUID format checks per your request)
  if (!signedWith) issues.push({ field: 'signedWith', message: 'signedWith is required' });
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



  if (issues.length > 0) return { success: false, issues };
let auth
 try {
      const area = await AreaService.getAreaById(areaId);
    if (!area) {
      return { success: false, issues: [{ field: 'areaId', message: 'Area not found' }] };
    }
    

    const location = await area.location();
    if (!location) {
      return { success: false, issues: [{ field: 'areaId', message: 'Area has no valid location' }] };
    }
    

     auth = await authorizeUserProjectAccessWorkerFirst( request,location.projectId);
    if (!auth.success) {
      // normalize the failure to our CreateAttendanceResult shape
      return { success: false, issues: auth.issues };
    }
    
  } catch (err: any) {
    logger.error('createAttendanceHandler: authorization failure', err);
    return { success: false, issues: parseDbError(err) };
  }

  try {
    await AttendanceService.createAttendance(
      timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
      signedWith,
      auth.callerUuid,
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
