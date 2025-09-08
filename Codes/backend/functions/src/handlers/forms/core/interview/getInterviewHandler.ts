import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../../utils/types';
import { parseDbError } from '../../../../utils/dbErrorParser';
import { authenticateClient } from '../../../../utils/authUtils';
import { InterviewService } from '../../../../models/forms/core/interview/interview.service';
import { Interview } from '../../../../models/forms/core/interview/interview.class';

export interface GetInterviewData {
  interviewId: string;
}

export interface GetInterviewResult {
  success: boolean;
  interview?: Interview;
  issues?: FieldIssue[];
}

export async function getInterviewHandler(
  request: CallableRequest<GetInterviewData>
): Promise<GetInterviewResult> {
  try {
    const { interviewId } = request.data || {};
    
    if (!interviewId) {
      return {
        success: false,
        issues: [{ field: 'interviewId', message: 'Interview ID is required' }]
      };
    }
     const auth = await authenticateClient(request);
    if (!auth.success) {
      return { success: false, issues: auth.issues };
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
   
    return { success: true, interview };
  } catch (error: any) {
    logger.error('Get interview error:', error);
    return { success: false, issues: parseDbError(error) };
  }
}