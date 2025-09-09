// updateInterviewHandler.ts
import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../../utils/types';
import { parseDbError } from '../../../../utils/dbErrorParser';
import { authorizeUserProjectAccessWorkerFirst } from '../../../../utils/authUtils';
import { InterviewService } from '../../../../models/forms/core/interview/interview.service';
export interface UpdateInterviewData {
  interviewId: string;
  projectId: string;
  title: string; // Added title field
}

export interface UpdateInterviewResult {
  success: boolean;
  issues?: FieldIssue[];
}

export async function updateInterviewHandler(
  request: CallableRequest<UpdateInterviewData>
): Promise<UpdateInterviewResult> {
  try {
    const { interviewId, projectId,title} = request.data || {};
    
    if (!interviewId) {
      return {
        success: false,
        issues: [{ field: 'interviewId', message: 'Interview ID is required' }]
      };
    }
    
    if (!projectId) {
      return {
        success: false,
        issues: [{ field: 'projectId', message: 'Project ID is required' }]
      };
    }
      if (!title) { // Added title validation
      return {
        success: false,
        issues: [{ field: 'title', message: 'Title is required' }]
      };
    }

    // Get interview first to check if it exists
    const existingInterview = await InterviewService.getInterviewById(interviewId);
    if (!existingInterview) {
      return {
        success: false,
        issues: [{ field: 'interviewId', message: 'Interview not found' }]
      };
    }

    // Authorize user access to both the current project and the new project
    const authCurrentProject = await authorizeUserProjectAccessWorkerFirst(request, existingInterview.projectId);
    if (!authCurrentProject.success) {
      return { success: false, issues: authCurrentProject.issues };
    }

    // If updating to a different project, check access to the new project too
    if (existingInterview.projectId !== projectId) {
      const authNewProject = await authorizeUserProjectAccessWorkerFirst(request, projectId);
      if (!authNewProject.success) {
        return { success: false, issues: authNewProject.issues };
      }
    }

    await InterviewService.updateInterview(interviewId, projectId,title);
    return { success: true };
  } catch (error: any) {
    logger.error('Update interview error:', error);
    return { success: false, issues: parseDbError(error) };
  }
}