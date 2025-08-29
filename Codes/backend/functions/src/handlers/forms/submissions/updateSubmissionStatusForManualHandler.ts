import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authorizeUserProjectAccessWorkerFirst } from '../../../utils/authUtils';
import { SubmissionService } from '../../../models/forms/submissions/submission/submission.service';
import { SubmissionOutcome } from '../../../models/submission_outcome.enum';

export interface UpdateSubmissionStatusForManualData {
  submissionId: string;
  outcome: string;
  projectId: string;
}

export interface UpdateSubmissionStatusForManualResult {
  success: boolean;
  issues?: FieldIssue[];
}

export async function updateSubmissionStatusForManualHandler(
  request: CallableRequest<UpdateSubmissionStatusForManualData>
): Promise<UpdateSubmissionStatusForManualResult> {
  const issues: FieldIssue[] = [];
  const { submissionId, outcome, projectId } = request.data || {};

  if (!submissionId) {
    issues.push({ field: 'submissionId', message: 'submissionId is required' });
  }
  
  if (!outcome) {
    issues.push({ field: 'outcome', message: 'outcome is required' });
  } else if (!Object.values(SubmissionOutcome).includes(outcome.toLowerCase() as SubmissionOutcome)) {
    issues.push({ 
      field: 'outcome', 
      message: `outcome must be one of: ${Object.values(SubmissionOutcome).join(', ')}` 
    });
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

    // Update submission status
    await SubmissionService.updateSubmissionStatusForManual(submissionId, outcome);

    return { success: true };
  } catch (dbErr: any) {
    logger.error('Update submission status for manual failed:', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }
}