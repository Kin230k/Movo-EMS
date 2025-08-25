import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../../utils/types';
import { parseDbError } from '../../../../utils/dbErrorParser';
import { authorizeUserProjectAccessWorkerFirst } from '../../../../utils/authUtils';
import { InterviewService } from '../../../../models/forms/core/interview/interview.service';
export interface DeleteInterviewData {
  interviewId: string;
}

export interface DeleteInterviewResult {
  success: boolean;
  issues?: FieldIssue[];
}

export async function deleteInterviewHandler(
  request: CallableRequest<DeleteInterviewData>
): Promise<DeleteInterviewResult> {
  try {
    const { interviewId } = request.data || {};
    
    if (!interviewId) {
      return {
        success: false,
        issues: [{ field: 'interviewId', message: 'Interview ID is required' }]
      };
    }

    // Get interview first to check project access
    const interview = await InterviewService.getInterviewById(interviewId);
    if (!interview) {
      return {
        success: false,
        issues: [{ field: 'interviewId', message: 'Interview not found' }]
      };
    }

    // Authorize user access to the project
    const auth = await authorizeUserProjectAccessWorkerFirst(request, interview.projectId);
    if (!auth.success) {
      return { success: false, issues: auth.issues };
    }

    await InterviewService.deleteInterview(interviewId);
    return { success: true };
  } catch (error: any) {
    logger.error('Delete interview error:', error);
    return { success: false, issues: parseDbError(error) };
  }
}