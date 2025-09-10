import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateUser } from '../../../utils/authUtils';
import { SubmissionService } from '../../../models/forms/submissions/submission/submission.service';
import { SubmissionOutcome } from '../../../models/submission_outcome.enum';
import { UserService } from '../../../models/auth/user/user.service';
import { sendSubmissionEmail } from '../../../utils/sendSubmissionEmail';
import { EmailService } from '../../../models/forms/core/email/email.service';

export interface UpdateSubmissionStatusData {
  submissionId: string;
  outcome: string;
  decisionNotes?: string;
  projectId: string;
}

export interface UpdateSubmissionStatusResult {
  success: boolean;
  issues?: FieldIssue[];
}

export async function updateSubmissionStatusHandler(
  request: CallableRequest<UpdateSubmissionStatusData>
): Promise<UpdateSubmissionStatusResult> {
  const issues: FieldIssue[] = [];
  const { submissionId, outcome, decisionNotes } = request.data || {};

  if (!submissionId) {
    issues.push({ field: 'submissionId', message: 'submissionId is required' });
  }

  if (!outcome) {
    issues.push({ field: 'outcome', message: 'outcome is required' });
  } else if (
    !Object.values(SubmissionOutcome).includes(outcome as SubmissionOutcome)
  ) {
    issues.push({
      field: 'outcome',
      message: `outcome must be one of: ${Object.values(SubmissionOutcome).join(
        ', '
      )}`,
    });
  }

  if (issues.length > 0) {
    return { success: false, issues };
  }

  try {
    // Authorize user access to the project
    const auth = await authenticateUser(request);
    if (!auth.success) {
      return { success: false, issues: auth.issues };
    }

    // Update submission status
    await SubmissionService.updateSubmissionStatus(
      submissionId,
      outcome,
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
  } catch (dbErr: any) {
    logger.error('Update submission status for manual failed:', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }
}
