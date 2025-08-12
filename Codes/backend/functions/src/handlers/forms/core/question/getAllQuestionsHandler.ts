import * as logger from 'firebase-functions/logger';
import { QuestionService } from '../../../../models/forms/core/question/question.service';
import { parseDbError } from '../../../../utils/dbErrorParser';

export async function getAllQuestionsHandler() {
  try {
    const questions = await QuestionService.getAllQuestions();
    return { success: true, questions };
  } catch (err: any) {
    logger.error('Fetching all questions failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
