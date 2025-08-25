import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../../utils/types';
import { parseDbError } from '../../../../utils/dbErrorParser';
import { authorizeUserProjectAccessWorkerFirst } from '../../../../utils/authUtils';
import { InterviewService } from '../../../../models/forms/core/interview/interview.service';

export interface CreateInterviewData {
  projectId: string;
}

export interface CreateInterviewResult {
  success: boolean;
  interviewId?: string;
  issues?: FieldIssue[];
}

export async function createInterviewHandler(
  request: CallableRequest<CreateInterviewData>
): Promise<CreateInterviewResult> {
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

    await InterviewService.createInterview(projectId);
    return { success: true };
  } catch (error: any) {
    logger.error('Create interview error:', error);
    return { success: false, issues: parseDbError(error) };
  }
}