import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { QuestionService } from '../../../../models/forms/core/question/question.service';
import { parseDbError } from '../../../../utils/dbErrorParser';
import { FieldIssue } from '../../../../utils/types';
import { authenticateUser } from '../../../../utils/authUtils';
interface DeleteQuestionRequestData {
  questionId: string;
}
export async function deleteQuestionHandler(
  request: CallableRequest<DeleteQuestionRequestData>
) {
  const issues: FieldIssue[] = [];

  const auth = await authenticateUser(request);
  if (!auth.success) return auth;

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
