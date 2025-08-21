import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateCaller } from '../../../utils/authUtils';
import { AttendanceService } from '../../../models/project/attendance/attendance.service';


export interface GetAllAttendancesResult {
  success: boolean;
  data?: any[];
  issues?: any;
}

export async function getAllAttendancesHandler(
  request: CallableRequest
): Promise<GetAllAttendancesResult> {
  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  try {
    const attendances = await AttendanceService.getAllAttendances();
    return { success: true, data: attendances };
  } catch (dbErr: any) {
    logger.error('Get all attendances failed:', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }
}
