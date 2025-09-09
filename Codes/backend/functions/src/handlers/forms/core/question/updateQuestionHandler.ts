import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { QuestionService } from '../../../../models/forms/core/question/question.service';
import { parseDbError } from '../../../../utils/dbErrorParser';
import { FieldIssue } from '../../../../utils/types';
import { authenticateUser } from '../../../../utils/authUtils';
interface UpdateQuestionData {
  questionId: string;
  typeCode: 'OPEN_ENDED'|'SHORT_ANSWER'|'NUMBER'|'RATE'|'DROPDOWN'|'RADIO'|'MULTIPLE_CHOICE';
  questionText: string;  // Changed from Multilingual to string
  
}

export async function updateQuestionHandler(request: CallableRequest<UpdateQuestionData>) {
  const issues: FieldIssue[] = [];

    const auth = await authenticateUser(request);
    if (!auth.success) return auth;
  // 1) Auth check
  if (!request.auth?.uid) {
    issues.push({ field: 'auth', message: 'Must be signed in' });
    return { success: false, issues };
  }

  // 2) Input extraction and validation
  const { questionId, typeCode, questionText } =
    request.data || {};
  if (!questionId || !typeCode || !questionText) {
    issues.push({
      field: 'input',
      message:
        'Missing required fields: questionId, typeCode, questionText, formId, interviewId',
    });
    return { success: false, issues };
  }
  const question=await QuestionService.getQuestionById(questionId);
  if(!question)
        issues.push({
      field: 'question',
      message:
        'There is no question with that id',
    });
   const formId=(question)?.formId;
   const interviewId=(question)?.interviewId;
   


  try {
    console.log(question);
    await QuestionService.updateQuestion(
      questionId,
      typeCode,
      questionText,  // Now passes string directly
      formId!,
      interviewId!
    );
    return { success: true };
  } catch (err: any) {
    logger.error('Question update failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}