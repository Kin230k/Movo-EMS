import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { SubmissionService } from '../../../models/forms/submissions/submission/submission.service';
import { authenticateUser } from '../../../utils/authUtils';
interface DeleteSubmissionRequestData {
  submissionId?: string;
}
export async function deleteSubmissionHandler(
  request: CallableRequest<DeleteSubmissionRequestData>
) {
  const issues: FieldIssue[] = [];

  const auth = await authenticateUser(request);
  if (!auth.success) return auth;

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
