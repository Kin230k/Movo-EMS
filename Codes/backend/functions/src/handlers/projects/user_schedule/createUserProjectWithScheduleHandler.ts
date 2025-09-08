import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateCaller } from '../../../utils/authUtils';

import { createUserProjectHandler,CreateUserProjectData } from '../user_project/createUserProjectHandler';
import { createScheduleHandler,CreateScheduleData } from '../schedules/createScheduleHandler';

export interface CreateUserProjectWithScheduleData {
  userId: string;
  projectId: string;
  startTime: string;
  endTime: string;
  locationId: string;
}

export interface CreateUserProjectWithScheduleResult {
  success: boolean;
  issues?: FieldIssue[];
  data?: any;
}

export async function createUserProjectWithScheduleHandler(
  request: CallableRequest<CreateUserProjectWithScheduleData>
): Promise<CreateUserProjectWithScheduleResult> {
  const issues: FieldIssue[] = [];
  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;
   
  if (!request.data.userId || !request.data.projectId) {
   issues.push({ field: 'general', message: 'userId and projectId required together' });
}  
if (issues.length > 0) return { success: false, issues };   
  
  try {
    // Call the existing userProject handler
    const userProjectReq = { ...request, data: { userId: request.data.userId, projectId: request.data.projectId } } as CallableRequest<CreateUserProjectData>;
    const userProjectRes = await createUserProjectHandler(userProjectReq);
    if (!userProjectRes.success) return userProjectRes;

    // Call the existing schedule handler
    const scheduleReq = {
      ...request,
      data: {
        startTime: request.data.startTime,
        endTime: request.data.endTime,
        projectId: request.data.projectId,
        locationId: request.data.locationId
      }
    } as CallableRequest<CreateScheduleData>;
    const scheduleRes = await createScheduleHandler(scheduleReq);
    if (!scheduleRes.success) return scheduleRes;



    return { success: true, data: { userProject: userProjectRes.data, schedule: scheduleRes } };
  } catch (err: any) {
    logger.error('Failed to create userProject with schedule:', err);
    return { success: false, issues: parseDbError(err) };
  }
}
