import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { firebaseUidToUuid } from '../../../utils/firebaseUidToUuid';
import { SubmissionService } from '../../../models/forms/submissions/submission/submission.service';
import { SubmissionOutcome } from '../../../models/submission_outcome.enum';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateUser } from '../../../utils/authUtils';
export interface CreateSubmissionRequestData {
  formId?: string;
  interviewId?: string;
  dateSubmitted?: string;
  outcome?: string;
  decisionNotes?: string;
}
export async function createSubmissionHandler(
  request: CallableRequest<CreateSubmissionRequestData>
) {
  const issues: FieldIssue[] = [];

  const auth = await authenticateUser(request);
  if (!auth.success) return auth;

  // 2) Extract and validate input
  const { formId, interviewId, dateSubmitted, outcome, decisionNotes } =
    request.data || {};

  if (!formId || !interviewId || !dateSubmitted) {
    issues.push({
      field: 'input',
      message: 'Missing required fields: formId, interviewId, dateSubmitted',
    });
    return { success: false, issues };
  }

  // Convert Firebase UID to UUID
  const userId = firebaseUidToUuid(request.auth!.uid);
  if (!userId) {
    issues.push({ field: 'userId', message: 'Invalid user ID' });
    return { success: false, issues };
  }

  // 3) Call service
  try {
    await SubmissionService.createSubmission(
      formId,
      userId,
      interviewId,
      new Date(dateSubmitted),
      outcome as SubmissionOutcome | undefined,
      decisionNotes
    );
    return { success: true };
  } catch (err: any) {
    logger.error('Submission creation failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
