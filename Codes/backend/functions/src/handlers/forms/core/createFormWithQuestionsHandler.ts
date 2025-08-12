import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FormService } from '../../../models/forms/core/form/form.service';
import { QuestionService } from '../../../models/forms/core/question/question.service';
import { CriteriaService } from '../../../models/forms/rules/criteria/criteria.service';
import { Multilingual } from '../../../models/multilingual.type';
import { parseDbError } from '../../../utils/dbErrorParser';
import { FieldIssue } from '../../../utils/types';
import { CriteriaOperator } from '../../../models/criteria_operator.enum';

interface QuestionInput {
  typeCode: string;
  questionText: Multilingual;
  interviewId: string;
  criteria?: {
    type: CriteriaOperator; // criteria_operator
    value: string;
  }[];
}

export async function createFormWithQuestionsHandler(request: CallableRequest) {
  const issues: FieldIssue[] = [];

  // 1) Auth validation
  if (!request.auth?.uid && process.env.FUNCTIONS_EMULATOR !== 'true') {
    issues.push({ field: 'auth', message: 'Must be signed in' });
    return { success: false, issues };
  }

  // 2) Extract and validate input
  const { projectId, locationId, questions } = request.data || {};
  if (!projectId || !locationId) {
    issues.push({
      field: 'input',
      message: 'Missing required fields: projectId, locationId',
    });
    return { success: false, issues };
  }
  if (!Array.isArray(questions) || questions.length === 0) {
    issues.push({
      field: 'questions',
      message: 'At least one question is required',
    });
    return { success: false, issues };
  }

  try {
    // 3) Create the form
    const formEntity = await FormService.createForm(projectId, locationId);

    // Here we need the generated formId
    const formId = (formEntity as any)?.formId; // Ensure your FormService returns the created formId
    if (!formId) {
      throw new Error('Form creation did not return formId');
    }

    // 4) Create questions and criteria
    for (const q of questions as QuestionInput[]) {
      const questionEntity = await QuestionService.createQuestion(
        q.typeCode,
        q.questionText,
        formId,
        q.interviewId
      );

      const questionId = (questionEntity as any)?.questionId; // Ensure service returns questionId
      if (!questionId) {
        throw new Error('Question creation did not return questionId');
      }

      if (q.criteria && Array.isArray(q.criteria)) {
        for (const c of q.criteria) {
          await CriteriaService.createCriterion(c.type, c.value, questionId);
        }
      }
    }

    return { success: true, formId };
  } catch (err: any) {
    logger.error('Form with questions creation failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
