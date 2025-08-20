import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { SubmissionService } from '../../../models/forms/submissions/submission/submission.service';
import { SubmissionOutcome } from '../../../models/submission_outcome.enum';
import { firebaseUidToUuid } from '../../../utils/firebaseUidToUuid';
import { authenticateUser } from '../../../utils/authUtils';
interface UpdateSubmissionRequestData {
  submissionId: string;
  formId: string;
  userId: string;
  interviewId: string;
  dateSubmitted: Date;
  outcome?: SubmissionOutcome;
  decisionNotes?: string;
}
export async function updateSubmissionHandler(
  request: CallableRequest<UpdateSubmissionRequestData>
) {
  const issues: FieldIssue[] = [];

  const auth = await authenticateUser(request);
  if (!auth.success) return auth;

  const {
    submissionId,
    formId,
    interviewId,
    dateSubmitted,
    outcome,
    decisionNotes,
  } = request.data || {};
  if (!submissionId || !formId || !interviewId || !dateSubmitted) {
    issues.push({
      field: 'input',
      message:
        'Missing required fields: submissionId, formId, interviewId, dateSubmitted',
    });
    return { success: false, issues };
  }

  const userId = firebaseUidToUuid(request.auth!.uid);
  if (!userId) {
    issues.push({ field: 'userId', message: 'Invalid user ID' });
    return { success: false, issues };
  }

  try {
    await SubmissionService.updateSubmission(
      submissionId,
      formId,
      userId,
      interviewId,
      new Date(dateSubmitted),
      outcome as SubmissionOutcome | undefined,
      decisionNotes
    );
    return { success: true };
  } catch (err: any) {
    logger.error('Submission update failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
