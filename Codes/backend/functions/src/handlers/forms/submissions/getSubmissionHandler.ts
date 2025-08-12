import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { SubmissionService } from '../../../models/forms/submissions/submission/submission.service';

export async function getSubmissionHandler(request: CallableRequest) {
  const issues: FieldIssue[] = [];

  const { submissionId } = request.data || {};
  if (!submissionId) {
    issues.push({
      field: 'input',
      message: 'Missing required field: submissionId',
    });
    return { success: false, issues };
  }

  try {
    const submission = await SubmissionService.getSubmissionById(submissionId);
    if (!submission) {
      return {
        success: false,
        issues: [{ field: 'submissionId', message: 'Submission not found' }],
      };
    }
    return { success: true, submission };
  } catch (err: any) {
    logger.error('Submission fetch failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
