import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { QuestionService } from '../../../../models/forms/core/question/question.service';
import { parseDbError } from '../../../../utils/dbErrorParser';
import { FieldIssue } from '../../../../utils/types';
import { authenticateUser } from '../../../../utils/authUtils';

interface CreateQuestionRequestData {
  typeCode: 'OPEN_ENDED'|'SHORT_ANSWER'|'NUMBER'|'RATE'|'DROPDOWN'|'RADIO'|'MULTIPLE_CHOICE';
  questionText: string;  // Changed from Multilingual to string
  formId: string;
  interviewId: string;
}

export async function createQuestionHandler(
  request: CallableRequest<CreateQuestionRequestData>
) {
  const issues: FieldIssue[] = [];

  const auth = await authenticateUser(request);
  if (!auth.success) return auth;

  // 2) Input extraction and validation
  const { typeCode, questionText, formId, interviewId } = request.data || {};
  if (!typeCode || !questionText || !formId || !interviewId) {
    issues.push({
      field: 'input',
      message:
        'Missing required fields: typeCode, questionText, formId, interviewId',
    });
    return { success: false, issues };
  }

  try {
    await QuestionService.createQuestion(
      typeCode,
      questionText,  // Now passes string directly
      formId,
      interviewId
    );
    return { success: true };
  } catch (err: any) {
    logger.error('Question creation failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}