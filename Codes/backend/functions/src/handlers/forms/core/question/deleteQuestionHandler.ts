import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { QuestionService } from '../../../../models/forms/core/question/question.service';
import { parseDbError } from '../../../../utils/dbErrorParser';
import { FieldIssue } from '../../../../utils/types';

export async function deleteQuestionHandler(request: CallableRequest) {
  const issues: FieldIssue[] = [];

  // 1) Auth check
  if (!request.auth?.uid && process.env.FUNCTIONS_EMULATOR !== 'true') {
    issues.push({ field: 'auth', message: 'Must be signed in' });
    return { success: false, issues };
  }

  // 2) Input extraction and validation
  const { questionId } = request.data || {};
  if (!questionId) {
    issues.push({
      field: 'input',
      message: 'Missing required field: questionId',
    });
    return { success: false, issues };
  }

  try {
    await QuestionService.deleteQuestion(questionId);
    return { success: true };
  } catch (err: any) {
    logger.error('Question deletion failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
