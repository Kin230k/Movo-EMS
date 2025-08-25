import * as logger from 'firebase-functions/logger';
import { QuestionService } from '../../../../models/forms/core/question/question.service';
import { parseDbError } from '../../../../utils/dbErrorParser';
import { authenticateUser } from '../../../../utils/authUtils';
import { CallableRequest } from 'firebase-functions/https';
import { FieldIssue } from '../../../../utils/types';

interface GetAllFormQuestionsData {
  formId: string;
}

export async function getAllFormQuestionsHandler(
  request: CallableRequest<GetAllFormQuestionsData>
) {
  const auth = await authenticateUser(request);
  if (!auth.success) return auth;
  const { formId } = request.data;

  const issues: FieldIssue[] = [];

  // 1) Field-level validation
  if (!formId) issues.push({ field: 'formId', message: 'Form is required' });
  if (issues.length > 0) {
    return { success: false, issues };
  }
  try {
    const questions = await QuestionService.getAllQuestionsByFormId(formId);
    return { success: true, questions };
  } catch (err: any) {
    logger.error('Fetching all questions failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
