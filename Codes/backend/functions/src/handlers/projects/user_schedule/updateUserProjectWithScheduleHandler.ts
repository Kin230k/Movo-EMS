import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateCaller } from '../../../utils/authUtils';

import { updateUserProjectHandler, UpdateUserProjectData } from '../user_project/updateUserProjectHandler';
import { updateScheduleHandler, UpdateScheduleData } from '../schedules/updateScheduleHandler';

export interface UpdateUserProjectWithScheduleData {
  userProjectId: string;
  userId: string;
  projectId: string;
  scheduleId: string;
  startTime: string;
  endTime: string;
  locationId: string;
}

export interface UpdateUserProjectWithScheduleResult {
  success: boolean;
  issues?: FieldIssue[];
  data?: any;
}

export async function updateUserProjectWithScheduleHandler(
  request: CallableRequest<UpdateUserProjectWithScheduleData>
): Promise<UpdateUserProjectWithScheduleResult> {
  const issues: FieldIssue[] = [];
  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  const {
    userProjectId,
    userId,
    projectId,
    scheduleId,
    startTime,
    endTime,
    locationId,
  } = request.data || {};

  // Validate required fields
  if (!userProjectId) issues.push({ field: 'userProjectId', message: 'userProjectId is required' });
  if (!userId) issues.push({ field: 'userId', message: 'userId is required' });
  if (!projectId) issues.push({ field: 'projectId', message: 'projectId is required' });
  if (!scheduleId) issues.push({ field: 'scheduleId', message: 'scheduleId is required' });
  if (!startTime) issues.push({ field: 'startTime', message: 'startTime is required' });
  if (!endTime) issues.push({ field: 'endTime', message: 'endTime is required' });
  if (!locationId) issues.push({ field: 'locationId', message: 'locationId is required' });

  if (issues.length > 0) return { success: false, issues };

  try {
    // Update user project
    const userProjectReq = {
      ...request,
      data: { userProjectId, userId, projectId },
    } as CallableRequest<UpdateUserProjectData>;
    const userProjectRes = await updateUserProjectHandler(userProjectReq);
    if (!userProjectRes.success) return userProjectRes;

    // Update schedule
    const scheduleReq = {
      ...request,
      data: { scheduleId, startTime, endTime, projectId, locationId },
    } as CallableRequest<UpdateScheduleData>;
    const scheduleRes = await updateScheduleHandler(scheduleReq);
    if (!scheduleRes.success) return scheduleRes;

    return {
      success: true,
      data: {
        userProject: userProjectRes.data,
        schedule: scheduleRes,
      },
    };
  } catch (err: any) {
    logger.error('Failed to update userProject with schedule:', err);
    return { success: false, issues: parseDbError(err) };
  }
}
