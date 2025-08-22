import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { firebaseUidToUuid } from '../../../utils/firebaseUidToUuid';
import { SubmissionService } from '../../../models/forms/submissions/submission/submission.service';
import { AnswerService } from '../../../models/forms/core/answer/answer.service';
import { SubmissionOutcome } from '../../../models/submission_outcome.enum';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateUser } from '../../../utils/authUtils';
import { SubmissionReminderService } from './submissionReminder.service';
import { v4 as uuidv4 } from 'uuid';

export interface CreateSubmissionWithAnswerRequestData {
  // Submission fields
  formId?: string;
  interviewId?: string;
  dateSubmitted?: string;
  outcome?: string;
  decisionNotes?: string;
  
  // Answer fields
  questionId?: string;
  answeredAt?: string;
  answerType?: 'text' | 'rating' | 'numeric' | 'options';
  textResponse?: string;
  rating?: number;
  numericResponse?: number;
  optionIds?: string[];
}

export async function createSubmissionWithAnswerHandler(
  request: CallableRequest<CreateSubmissionWithAnswerRequestData>
) {
  const issues: FieldIssue[] = [];

  // 1. Authentication
  const auth = await authenticateUser(request);
  if (!auth.success) return auth;

  // 2. Extract and validate input
  const {
    formId,
    interviewId,
    dateSubmitted,
    outcome,
    decisionNotes,
    questionId,
    answeredAt,
    answerType,
    textResponse,
    rating,
    numericResponse,
    optionIds
  } = request.data || {};

  // Validate required fields
  if (!formId) {
    issues.push({ field: 'formId', message: 'Form ID is required' });
  }
  if (!interviewId) {
    issues.push({ field: 'interviewId', message: 'Interview ID is required' });
  }
  if (!questionId) {
    issues.push({ field: 'questionId', message: 'Question ID is required' });
  }

  // Validate answer type and corresponding data
  if (answerType === 'text' && !textResponse) {
    issues.push({ field: 'textResponse', message: 'Text response is required for text answers' });
  } else if (answerType === 'rating' && (rating === undefined || rating === null)) {
    issues.push({ field: 'rating', message: 'Rating is required for rating answers' });
  } else if (answerType === 'numeric' && (numericResponse === undefined || numericResponse === null)) {
    issues.push({ field: 'numericResponse', message: 'Numeric response is required for numeric answers' });
  } else if (answerType === 'options' && (!optionIds || optionIds.length === 0)) {
    issues.push({ field: 'optionIds', message: 'Option IDs are required for options answers' });
  }

  if (issues.length > 0) {
    return { success: false, issues };
  }

  // Convert Firebase UID to UUID
  const userId = firebaseUidToUuid(request.auth!.uid);
  if (!userId) {
    issues.push({ field: 'userId', message: 'Invalid user ID' });
    return { success: false, issues };
  }

  try {
    // 3. Generate IDs
    const submissionId = uuidv4();
    const answerId = uuidv4();

    // 4. Create submission
    await SubmissionService.createSubmission(
      submissionId,
      formId!,
      userId,
      interviewId!,
      new Date(dateSubmitted || Date.now()),
      outcome as SubmissionOutcome | undefined,
      decisionNotes
    );

    // 5. Create answer based on type
    switch (answerType) {
      case 'text':
        await AnswerService.createTextAnswer(
          answerId,
          submissionId,
          questionId!,
          textResponse!,
          answeredAt ? new Date(answeredAt) : new Date()
        );
        break;
      case 'rating':
        await AnswerService.createRatingAnswer(
          answerId,
          submissionId,
          questionId!,
          rating!,
          answeredAt ? new Date(answeredAt) : new Date()
        );
        break;
      case 'numeric':
        await AnswerService.createNumericAnswer(
          answerId,
          submissionId,
          questionId!,
          numericResponse!,
          answeredAt ? new Date(answeredAt) : new Date()
        );
        break;
      case 'options':
        await AnswerService.createOptionsAnswer(
          answerId,
          submissionId,
          questionId!,
          optionIds!,
          undefined, // optionTexts can be populated later if needed
          answeredAt ? new Date(answeredAt) : new Date()
        );
        break;
      default:
        throw new Error('Invalid answer type');
    }

    // 6. Schedule reminder email after 10 minutes
    await SubmissionReminderService.scheduleReminder(
      submissionId,
      userId,
      request.auth!.token.email
    );

    logger.info('Submission with answer created successfully', {
      submissionId,
      answerId
    });

    return { 
      success: true, 
      submissionId, 
      answerId 
    };
  } catch (err: any) {
    logger.error('Submission with answer creation failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}