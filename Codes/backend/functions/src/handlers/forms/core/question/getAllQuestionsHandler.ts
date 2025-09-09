import * as logger from 'firebase-functions/logger';
import { QuestionService } from '../../../../models/forms/core/question/question.service';
import { parseDbError } from '../../../../utils/dbErrorParser';
import { authenticateClient } from '../../../../utils/authUtils';
import { CallableRequest } from 'firebase-functions/https';

export async function getAllQuestionsHandler(request: CallableRequest) {
  const auth = await authenticateClient(request);
  if (!auth.success) return auth;
  try {
    const questions = await QuestionService.getAllQuestions();
    return { success: true, questions };
  } catch (err: any) {
    logger.error('Fetching all questions failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
