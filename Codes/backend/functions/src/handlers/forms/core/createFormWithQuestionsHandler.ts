import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FormService } from '../../../models/forms/core/form/form.service';
import { QuestionService } from '../../../models/forms/core/question/question.service';
import { CriteriaService } from '../../../models/forms/rules/criteria/criteria.service';
import { Multilingual } from '../../../models/multilingual.type';
import { parseDbError } from '../../../utils/dbErrorParser';
import { FieldIssue } from '../../../utils/types';
import { CriteriaOperator } from '../../../models/criteria_operator.enum';
import { authenticateClient } from '../../../utils/authUtils';

/**
 * Runtime shapes for input (exported so other modules/tests can use them)
 */
export interface CriteriaInput {
  type: CriteriaOperator;
  value: string;
}

export interface QuestionInput {
  typeCode: string;
  questionText: Multilingual;
  interviewId: string;
  criteria?: CriteriaInput[];
}

export interface CreateFormWithQuestionsRequestData {
  projectId?: string | null;
  locationId?: string | null;
  questions?: QuestionInput[] | null;
}

/**
 * Simple runtime validators (keeps the handler defensive)
 */
const MAX_ID_LENGTH = 256;

function isNonEmptyString(v: unknown): v is string {
  return (
    typeof v === 'string' && v.trim().length > 0 && v.length <= MAX_ID_LENGTH
  );
}

function isMultilingual(v: unknown): v is Multilingual {
  return typeof v === 'object' && v !== null; // you can tighten this if Multilingual has known keys
}

function isValidCriteriaOperator(v: unknown): v is CriteriaOperator {
  // Works for numeric or string enums
  return Object.values(CriteriaOperator).includes(v as any);
}

/**
 * Handler (typed + validated)
 */
export async function createFormWithQuestionsHandler(request: CallableRequest) {
  const issues: FieldIssue[] = [];

  // auth
  const auth = await authenticateClient(request);
  if (!auth.success) return auth;

  // cast and defend
  const data = (request.data ?? {}) as CreateFormWithQuestionsRequestData;

  const projectId = isNonEmptyString(data.projectId)
    ? data.projectId.trim()
    : null;
  const locationId = isNonEmptyString(data.locationId)
    ? data.locationId.trim()
    : null;
  const questions = Array.isArray(data.questions)
    ? (data.questions as QuestionInput[])
    : null;

  if (!projectId) {
    issues.push({
      field: 'projectId',
      message: 'projectId is required and must be a non-empty string',
    });
  }
  if (!locationId) {
    issues.push({
      field: 'locationId',
      message: 'locationId is required and must be a non-empty string',
    });
  }
  if (!questions || questions.length === 0) {
    issues.push({
      field: 'questions',
      message: 'At least one question is required',
    });
  }

  // validate each question minimally
  if (questions && questions.length > 0) {
    questions.forEach((q, idx) => {
      if (!isNonEmptyString(q.typeCode)) {
        issues.push({
          field: `questions[${idx}].typeCode`,
          message: 'typeCode must be a non-empty string',
        });
      }
      if (!isMultilingual(q.questionText)) {
        issues.push({
          field: `questions[${idx}].questionText`,
          message: 'questionText must be a Multilingual object',
        });
      }
      if (!isNonEmptyString(q.interviewId)) {
        issues.push({
          field: `questions[${idx}].interviewId`,
          message: 'interviewId must be a non-empty string',
        });
      }
      if (q.criteria) {
        if (!Array.isArray(q.criteria)) {
          issues.push({
            field: `questions[${idx}].criteria`,
            message: 'criteria must be an array',
          });
        } else {
          q.criteria.forEach((c, cidx) => {
            if (!isValidCriteriaOperator(c.type)) {
              issues.push({
                field: `questions[${idx}].criteria[${cidx}].type`,
                message: 'criteria.type is invalid',
              });
            }
            if (!isNonEmptyString(c.value)) {
              issues.push({
                field: `questions[${idx}].criteria[${cidx}].value`,
                message: 'criteria.value must be a non-empty string',
              });
            }
          });
        }
      }
    });
  }

  if (issues.length > 0) {
    logger.warn('Validation failed for createFormWithQuestionsHandler input', {
      issues,
    });
    return { success: false, issues };
  }

  try {
    // 3) Create the form
    const formEntity = await FormService.createForm(projectId!, locationId!);
    const formId = (formEntity as any)?.formId;
    if (!isNonEmptyString(formId)) {
      throw new Error('Form creation did not return formId');
    }

    // 4) Create questions and criteria
    for (const q of questions!) {
      const questionEntity = await QuestionService.createQuestion(
        q.typeCode,
        q.questionText,
        formId,
        q.interviewId
      );

      const questionId = (questionEntity as any)?.questionId;
      if (!isNonEmptyString(questionId)) {
        throw new Error('Question creation did not return questionId');
      }

      if (Array.isArray(q.criteria) && q.criteria.length > 0) {
        for (const c of q.criteria) {
          await CriteriaService.createCriterion(c.type, c.value, questionId);
        }
      }
    }

    logger.info('Form with questions created', {
      projectId,
      locationId,
      formId,
    });
    return { success: true, formId };
  } catch (err: any) {
    logger.error('Form with questions creation failed', { err });
    const parsed = parseDbError(err);
    const responseIssues: FieldIssue[] =
      Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : [
            {
              field: 'server',
              message:
                'An unexpected error occurred while creating the form with questions',
            },
          ];

    return { success: false, issues: responseIssues };
  }
}
