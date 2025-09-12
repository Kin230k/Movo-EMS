import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { QuestionService } from '../../../../models/forms/core/question/question.service';
import { parseDbError } from '../../../../utils/dbErrorParser';
import { FieldIssue } from '../../../../utils/types';
import { authenticateUser } from '../../../../utils/authUtils';
import { OptionService } from '../../../../models/forms/core/option/option.service';
import { CriteriaService } from '../../../../models/forms/rules/criteria/criteria.service';
import { CriteriaOperator } from '../../../../models/criteria_operator.enum';

interface UpdateOptionInput {
  optionText: string;
  isCorrect: boolean;
}

interface UpdateCriteriaInput {
  type: CriteriaOperator;
  value: string;
  effect: 'PASS' | 'FAIL';
}

interface UpdateQuestionData {
  questionId: string;
  typeCode:
    | 'OPEN_ENDED'
    | 'SHORT_ANSWER'
    | 'NUMBER'
    | 'RATE'
    | 'DROPDOWN'
    | 'RADIO'
    | 'MULTIPLE_CHOICE';
  questionText: string; // Changed from Multilingual to string
  options?: UpdateOptionInput[];
  criteria?: UpdateCriteriaInput[];
}

export async function updateQuestionHandler(
  request: CallableRequest<UpdateQuestionData>
) {
  const issues: FieldIssue[] = [];

  const auth = await authenticateUser(request);
  if (!auth.success) return auth;
  // 1) Auth check
  if (!request.auth?.uid) {
    issues.push({ field: 'auth', message: 'Must be signed in' });
    return { success: false, issues };
  }

  // 2) Input extraction and validation
  const { questionId, typeCode, questionText, options, criteria } =
    request.data || ({} as any);
  if (!questionId || !typeCode || !questionText) {
    issues.push({
      field: 'input',
      message: 'Missing required fields: questionId, typeCode, questionText',
    });
    return { success: false, issues };
  }
  const question = await QuestionService.getQuestionById(questionId);
  if (!question)
    issues.push({
      field: 'question',
      message: 'There is no question with that id',
    });
  const formId = question?.formId;
  const interviewId = question?.interviewId;

  try {
    await QuestionService.updateQuestion(
      questionId,
      typeCode,
      questionText, // Now passes string directly
      formId!,
      interviewId!
    );

    // Replace OPTIONS if provided
    if (typeCode === 'MULTIPLE_CHOICE') {
      // Ensure we remove existing options and recreate according to provided list
      const existingOptions = await OptionService.getOptionsByQuestion(
        questionId
      );
      if (Array.isArray(existingOptions)) {
        for (const existing of existingOptions) {
          // @ts-ignore optionId exists on mapped entity
          if (existing?.optionId)
            await OptionService.deleteOption((existing as any).optionId);
        }
      }
      if (Array.isArray(options)) {
        for (let i = 0; i < options.length; i++) {
          const o = options[i];
          await OptionService.createOption(
            o.optionText,
            questionId,
            !!o.isCorrect,
            i
          );
        }
      }
    } else {
      // For non-multiple choice, ensure options are cleared if any existed
      const existingOptions = await OptionService.getOptionsByQuestion(
        questionId
      );
      if (Array.isArray(existingOptions) && existingOptions.length > 0) {
        for (const existing of existingOptions) {
          // @ts-ignore optionId exists on mapped entity
          if (existing?.optionId)
            await OptionService.deleteOption((existing as any).optionId);
        }
      }
    }

    // Replace CRITERIA if provided
    if (Array.isArray(criteria)) {
      const questionWithCriteria = await QuestionService.getQuestionById(
        questionId
      );
      const existingCriteria: any[] =
        (questionWithCriteria as any)?.criteria || [];
      if (Array.isArray(existingCriteria) && existingCriteria.length > 0) {
        for (const c of existingCriteria) {
          if (c?.criterionId) {
            await CriteriaService.deleteCriterion(c.criterionId);
          }
        }
      }
      for (const c of criteria) {
        await CriteriaService.createCriterion(
          c.type,
          c.value,
          questionId,
          c.effect
        );
      }
    }

    return { success: true };
  } catch (err: any) {
    logger.error('Question update failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
