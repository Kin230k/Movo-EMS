import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { QuestionService } from '../../../../models/forms/core/question/question.service';
import { parseDbError } from '../../../../utils/dbErrorParser';
import { FieldIssue } from '../../../../utils/types';
import { authenticateUser } from '../../../../utils/authUtils';
interface GetQuestionData {
  questionId: string;
}
export async function getQuestionHandler(
  request: CallableRequest<GetQuestionData>
) {
  const issues: FieldIssue[] = [];
  const auth = await authenticateUser(request);
  if (!auth.success) return auth;

  const { questionId } = request.data || {};
  if (!questionId) {
    issues.push({
      field: 'input',
      message: 'Missing required field: questionId',
    });
    return { success: false, issues };
  }

  try {
    const question = await QuestionService.getQuestionById(questionId);
    if (!question) {
      return {
        success: false,
        issues: [{ field: 'questionId', message: 'Question not found' }],
      };
    }
    return { success: true, question };
  } catch (err: any) {
    logger.error('Question fetch failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
