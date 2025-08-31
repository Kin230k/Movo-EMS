import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateCaller } from '../../../utils/authUtils';
import { ScheduleService } from '../../../models/project/schedule/schedule.service';
import { Schedule } from '../../../models/project/schedule/schedule.class';

export interface GetSchedulesByProjectOrLocationData {
  projectId?: string;
  locationId?: string;
}

export interface GetSchedulesByProjectOrLocationResult {
  success: boolean;
  schedules?: Schedule[];
  issues?: FieldIssue[];
}

export async function getSchedulesByProjectOrLocationHandler(
  request: CallableRequest<GetSchedulesByProjectOrLocationData>
): Promise<GetSchedulesByProjectOrLocationResult> {
  const issues: FieldIssue[] = [];
  const auth = await authenticateCaller(request);
  if (!auth.success) return { success: false, issues: auth.issues || [] };

  const { projectId, locationId } = request.data || {};

  // Validate that at least one parameter is provided
  if (!projectId && !locationId) {
    issues.push({
      field: 'projectId/locationId',
      message: 'Either projectId or locationId must be provided',
    });
  }

  if (issues.length > 0) return { success: false, issues };

  try {
    const schedules = await ScheduleService.getSchedulesByProjectOrLocation(
      projectId,
      locationId
    );
    return { success: true, schedules };
  } catch (dbErr: any) {
    logger.error('Schedules retrieval by project or location failed:', dbErr);
    const dbIssues = parseDbError(dbErr);
    return { success: false, issues: dbIssues };
  }
}
