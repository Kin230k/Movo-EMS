import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { SubmissionService } from '../../../models/forms/submissions/submission/submission.service';
import { SubmissionOutcome } from '../../../models/submission_outcome.enum';
import { firebaseUidToUuid } from '../../../utils/firebaseUidToUuid';
import { authenticateUser } from '../../../utils/authUtils';
import { EmailService } from '../../../models/forms/core/email/email.service';
import { sendSubmissionEmail } from '../../../utils/sendSubmissionEmail';
import { UserService } from '../../../models/auth/user/user.service';
interface UpdateSubmissionRequestData {
  submissionId: string;
  formId?: string;
  userId?: string;
  interviewId?: string;
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
    outcome,
    decisionNotes,
    userId: user,
  } = request.data || {};
  if (!submissionId) {
    issues.push({
      field: 'input',
      message: 'Missing required fields: submissionId, formId, interviewId',
    });
    return { success: false, issues };
  }
  let userId = user ? firebaseUidToUuid(user) : undefined;

  try {
    await SubmissionService.updateSubmission(
      submissionId,
      formId!,
      userId,
      interviewId!,
      null,
      outcome as SubmissionOutcome | undefined,
      decisionNotes
    );

    try {
      // 5. Gather email data

      // Read latest submission to get computed outcome and decision notes
      const latestSubmission = await SubmissionService.getSubmissionById(
        submissionId
      );

      const user = await UserService.getUserById(
        latestSubmission?.userId ?? ''
      );
      const to = user?.email ?? '';
      const displayName =
        (user?.name as any)?.en ?? (user?.name as any)?.ar ?? 'User';
      const status = (latestSubmission?.outcome as any) ?? 'MANUAL_REVIEW';
      const details = latestSubmission?.decisionNotes ?? undefined;
      const formId = latestSubmission?.formId ?? undefined;

      const actionLink = formId ? undefined : undefined;
      const confirmLink = status === 'ACCEPTED' ? undefined : undefined;

      if (to) {
        const html = await sendSubmissionEmail(
          to,
          displayName,
          status,
          details,
          actionLink,
          confirmLink,
          auth.callerUuid
        );
        try {
          await EmailService.createEmail(to, html!, formId!);
        } catch (err: any) {
          logger.error('Email Cannot be Created to Database', err);
          return { success: false, issues: parseDbError(err) };
        }
      }
    } catch (err: any) {
      logger.error('Error sending email', err);
      return { success: false, issues: parseDbError(err) };
    }

    return { success: true };
  } catch (err: any) {
    logger.error('Submission update failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
