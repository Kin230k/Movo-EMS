import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../../utils/types';
import { parseDbError } from '../../../../utils/dbErrorParser';
import { authorizeUserProjectAccessWorkerFirst } from '../../../../utils/authUtils';
import { InterviewService } from '../../../../models/forms/core/interview/interview.service';
import { Interview } from '../../../../models/forms/core/interview/interview.class';

export interface GetInterviewsByProjectData {
  projectId: string;
}

export interface GetInterviewsByProjectResult {
  success: boolean;
  interviews?: Interview[];
  issues?: FieldIssue[];
}

export async function getInterviewsByProjectHandler(
  request: CallableRequest<GetInterviewsByProjectData>
): Promise<GetInterviewsByProjectResult> {
  try {
    const { projectId } = request.data || {};
    
    if (!projectId) {
      return {
        success: false,
        issues: [{ field: 'projectId', message: 'Project ID is required' }]
      };
    }

    // Authorize user access to the project
    const auth = await authorizeUserProjectAccessWorkerFirst(request, projectId);
    if (!auth.success) {
      return { success: false, issues: auth.issues };
    }

    const interviews = await InterviewService.getInterviewsByProjectId(projectId);
    return { success: true, interviews };
  } catch (error: any) {
    logger.error('Get interviews by project error:', error);
    return { success: false, issues: parseDbError(error) };
  }
}