import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { SubmissionService } from '../../../models/forms/submissions/submission/submission.service';
import { AnswerService } from '../../../models/forms/core/answer/answer.service';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateUser } from '../../../utils/authUtils';
import { sendSubmissionEmail } from '../../../utils/sendSubmissionEmail';
import { UserService } from '../../../models/auth/user/user.service';
import { EmailService } from '../../../models/forms/core/email/email.service';
export interface CreateSubmissionWithAnswersRequestData {
  // Submission fields
  userId?: string;
  formId?: string;
  interviewId?: string;
  outcome?: string;
  decisionNotes?: string;

  // Array of answer fields
  answers: Array<{
    questionId?: string;
    answerType?: 'text' | 'rating' | 'numeric' | 'options';
    textResponse?: string;
    rating?: number;
    numericResponse?: number;
    optionIds?: string[];
  }>;
}

export async function createSubmissionWithAnswersHandler(
  request: CallableRequest<CreateSubmissionWithAnswersRequestData>
) {
  const issues: FieldIssue[] = [];

  // 1. Authentication
  const auth = await authenticateUser(request);
  if (!auth.success) return auth;

  // 2. Extract and validate input
  const { formId, interviewId, userId, decisionNotes, answers, outcome } =
    request.data || {};

  if (interviewId && !userId) {
    issues.push({
      field: 'userId',
      message: 'User ID is required when an interview ID is provided',
    });
  }
  // Validate answers array
  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    issues.push({
      field: 'answers',
      message: 'Answers array is required and must not be empty',
    });
  } else {
    answers.forEach((answer, index) => {
      if (!answer.questionId) {
        issues.push({
          field: `answers[${index}].questionId`,
          message: 'Question ID is required',
        });
      }

      // Validate answer type and corresponding data
      if (answer.answerType === 'text' && !answer.textResponse) {
        issues.push({
          field: `answers[${index}].textResponse`,
          message: 'Text response is required for text answers',
        });
      } else if (
        answer.answerType === 'rating' &&
        (answer.rating === undefined || answer.rating === null)
      ) {
        issues.push({
          field: `answers[${index}].rating`,
          message: 'Rating is required for rating answers',
        });
      } else if (
        answer.answerType === 'numeric' &&
        (answer.numericResponse === undefined ||
          answer.numericResponse === null)
      ) {
        issues.push({
          field: `answers[${index}].numericResponse`,
          message: 'Numeric response is required for numeric answers',
        });
      } else if (
        answer.answerType === 'options' &&
        (!answer.optionIds || answer.optionIds.length === 0)
      ) {
        issues.push({
          field: `answers[${index}].optionIds`,
          message: 'Option IDs are required for options answers',
        });
      }

      // If answerType is not provided, try to infer it
      if (!answer.answerType) {
        if (answer.textResponse !== undefined) answer.answerType = 'text';
        else if (answer.rating !== undefined) answer.answerType = 'rating';
        else if (answer.numericResponse !== undefined)
          answer.answerType = 'numeric';
        else if (answer.optionIds !== undefined) answer.answerType = 'options';
        else {
          issues.push({
            field: `answers[${index}].answerType`,
            message: 'Answer type could not be inferred from provided data',
          });
        }
      }
    });
  }

  if (issues.length > 0) {
    return { success: false, issues };
  }

  try {
    let submissionId;
    if (interviewId) {
      submissionId = await SubmissionService.createSubmission(
        formId!,
        userId!,
        interviewId!,
        new Date(Date.now()).toISOString(),
        decisionNotes
      );
    } else {
      // 3. Create submission and capture generated submissionId
      submissionId = await SubmissionService.createSubmission(
        formId!,
        auth.callerUuid,
        undefined,
        new Date(Date.now()).toISOString(),
        undefined
      );
    }
    if (!submissionId) {
      issues.push({ field: 'interviewId', message: 'Interview not found' });
      return { success: false, issues };
    }
    // 4. Create answers in bulk
    const answerIds = await AnswerService.createAnswers(submissionId, answers);

    logger.info('Submission with answers created successfully', {
      submissionId,
      answerIds,
    });
    if (interviewId) {
      await SubmissionService.updateSubmissionStatus(submissionId, outcome!);
    }
    try {
      // 5. Gather email data
      const user = await UserService.getUserById(auth.callerUuid);
      const to = user?.email ?? '';
      const displayName =
        (user?.name as any)?.en ?? (user?.name as any)?.ar ?? 'User';

      // Read latest submission to get computed outcome and decision notes
      const latestSubmission = await SubmissionService.getSubmissionById(
        submissionId
      );
      const status = (latestSubmission?.outcome as any) ?? 'MANUAL_REVIEW';
      const details = latestSubmission?.decisionNotes ?? undefined;

      // Optional links (set if you have a frontend route)
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

    return {
      success: true,
      submissionId,
      answerIds,
    };
  } catch (err: any) {
    logger.error('Submission with answers creation failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
