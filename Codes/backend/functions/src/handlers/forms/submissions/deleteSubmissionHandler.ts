import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { SubmissionService } from '../../../models/forms/submissions/submission/submission.service';

export async function deleteSubmissionHandler(request: CallableRequest) {
  const issues: FieldIssue[] = [];

  if (!request.auth?.uid && process.env.FUNCTIONS_EMULATOR !== 'true') {
    issues.push({ field: 'auth', message: 'Must be signed in' });
    return { success: false, issues };
  }

  const { submissionId } = request.data || {};
  if (!submissionId) {
    issues.push({
      field: 'input',
      message: 'Missing required field: submissionId',
    });
    return { success: false, issues };
  }

  try {
    await SubmissionService.deleteSubmission(submissionId);
    return { success: true };
  } catch (err: any) {
    logger.error('Submission deletion failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
