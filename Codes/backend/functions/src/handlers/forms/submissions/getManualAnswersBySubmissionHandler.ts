import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authorizeUserProjectAccessWorkerFirst } from '../../../utils/authUtils';
import { AnswerService } from '../../../models/forms/core/answer/answer.service';

export interface GetManualAnswersBySubmissionIdData {
  submissionId: string;
  projectId: string;
}

export interface GetManualAnswersBySubmissionIdResult {
  success: boolean;
  data?: any | null;
  issues?: FieldIssue[];
}

export async function getManualAnswersBySubmissionIdHandler(
  request: CallableRequest<GetManualAnswersBySubmissionIdData>
): Promise<GetManualAnswersBySubmissionIdResult> {
  const issues: FieldIssue[] = [];
  const { submissionId, projectId } = request.data || {};

  if (!submissionId) {
    issues.push({ field: 'submissionId', message: 'submissionId is required' });
  }
  if (!projectId) {
    issues.push({ field: 'projectId', message: 'projectId is required' });
  }

  if (issues.length > 0) {
    return { success: false, issues };
  }

  try {
    // Authorize user access to the project
    const auth = await authorizeUserProjectAccessWorkerFirst(request, projectId);
    if (!auth.success) {
      return { success: false, issues: auth.issues };
    }

    // Fetch manual answers
    const answers = await AnswerService.getManualAnswersBySubmissionId(submissionId);

    return { success: true, data: answers };
  } catch (dbErr: any) {
    logger.error('Get manual answers by submissionId failed:', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }
}