import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { QuestionService } from '../../../../models/forms/core/question/question.service';
import { Multilingual } from '../../../../models/multilingual.type';
import { parseDbError } from '../../../../utils/dbErrorParser';
import { FieldIssue } from '../../../../utils/types';
import { authenticateUser } from '../../../../utils/authUtils';
interface CreateQuestionRequestData {
  typeCode: string;
  questionText: Multilingual;
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
      questionText as Multilingual,
      formId,
      interviewId
    );
    return { success: true };
  } catch (err: any) {
    logger.error('Question creation failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
