import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { QuestionService } from '../../../../models/forms/core/question/question.service';
import { Multilingual } from '../../../../models/multilingual.type';
import { parseDbError } from '../../../../utils/dbErrorParser';
import { FieldIssue } from '../../../../utils/types';

interface UpdateQuestionData {
  questionId: string;
  typeCode: 'OPEN_ENDED'|'SHORT_ANSWER'|'NUMBER'|'RATE'|'DROPDOWN'|'RADIO'|'MULTIPLE_CHOICE' ;
  questionText: Multilingual;
  formId: string;
  interviewId: string;
}

export async function updateQuestionHandler(request: CallableRequest<UpdateQuestionData>) {
  const issues: FieldIssue[] = [];

  // 1) Auth check
  if (!request.auth?.uid) {
    issues.push({ field: 'auth', message: 'Must be signed in' });
    return { success: false, issues };
  }

  // 2) Input extraction and validation
  const { questionId, typeCode, questionText, formId, interviewId } =
    request.data || {};
  if (!questionId || !typeCode || !questionText || !formId || !interviewId) {
    issues.push({
      field: 'input',
      message:
        'Missing required fields: questionId, typeCode, questionText, formId, interviewId',
    });
    return { success: false, issues };
  }

  try {
    await QuestionService.updateQuestion(
      questionId,
      typeCode,
      questionText as Multilingual,
      formId,
      interviewId
    );
    return { success: true };
  } catch (err: any) {
    logger.error('Question update failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}