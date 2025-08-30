import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { QuestionService } from '../../../models/forms/core/question/question.service';
import { CriteriaService } from '../../../models/forms/rules/criteria/criteria.service';
import { Multilingual } from '../../../models/multilingual.type';
import { parseDbError } from '../../../utils/dbErrorParser';
import { FieldIssue } from '../../../utils/types';
import { CriteriaOperator } from '../../../models/criteria_operator.enum';
import { authenticateClient } from '../../../utils/authUtils';
import { OptionService } from '../../../models/forms/core/option/option.service';


export interface CriteriaInput {
  type: CriteriaOperator;
  value: string;
  effect: "PASS" | "FAIL";
}

export interface OptionInput {
  optionText: string;
  isCorrect: boolean;
}

export interface QuestionInput {
  typeCode: 'OPEN_ENDED'|'SHORT_ANSWER'|'NUMBER'|'RATE'|'DROPDOWN'|'RADIO'|'MULTIPLE_CHOICE';
  questionText: string;
  interviewId: string;
  criteria?: CriteriaInput[];
  options?: OptionInput[];
}

export interface CreateQuestionsRequestData {
  formId: string;
  questions: QuestionInput[];
}

const MAX_ID_LENGTH = 256;

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0 && v.length <= MAX_ID_LENGTH;
}

function isMultilingual(v: unknown): v is Multilingual {
  return typeof v === 'object' && v !== null;
}

function isValidCriteriaOperator(v: unknown): v is CriteriaOperator {
  return Object.values(CriteriaOperator).includes(v as any);
}

export async function createQuestionsHandler(
  request: CallableRequest<CreateQuestionsRequestData>
) {
  const issues: FieldIssue[] = [];
  const auth = await authenticateClient(request);
  if (!auth.success) return auth;

  const data = request.data;
  if (!data) {
    return { success: false, issues: [{ field: 'data', message: 'Request data is missing' }] };
  }

  if (!isNonEmptyString(data.formId)) {
    issues.push({ field: 'formId', message: 'formId is required and must be a non-empty string' });
  }

   const questions = data.questions;
  if (!Array.isArray(questions) || questions.length === 0) {
    issues.push({ field: 'questions', message: 'At least one question is required' });
  } else {
    // Add this validation for question types
    const validTypeCodes = ['OPEN_ENDED', 'SHORT_ANSWER', 'NUMBER', 'RATE', 'DROPDOWN', 'RADIO', 'MULTIPLE_CHOICE'];

    questions.forEach((q, idx) => {
      if (!isNonEmptyString(q.typeCode)) {
        issues.push({ field: `questions[${idx}].typeCode`, message: 'typeCode must be a non-empty string' });
      } else if (!validTypeCodes.includes(q.typeCode)) {
        issues.push({ 
          field: `questions[${idx}].typeCode`, 
          message: `typeCode must be one of: ${validTypeCodes.join(', ')}` 
        });
      }
      
      if (!isNonEmptyString(q.questionText)) {
        issues.push({ field: `questions[${idx}].questionText`, message: 'questionText must be a non-empty string' });
      }
      
      if (!isNonEmptyString(q.interviewId)) {
        issues.push({ field: `questions[${idx}].interviewId`, message: 'interviewId must be a non-empty string' });
      }
      
      // Only validate options for OPTION type questions
      if (q.typeCode === 'MULTIPLE_CHOICE') {
        if (!Array.isArray(q.options) || q.options.length === 0) {
          issues.push({ field: `questions[${idx}].options`, message: 'Options are required for OPTION type questions' });
        } else {
          q.options.forEach((o, oidx) => {
            if (!isMultilingual(o.optionText)) {
              issues.push({ field: `questions[${idx}].options[${oidx}].optionText`, message: 'optionText must be a Multilingual object' });
            }
            if (typeof o.isCorrect !== 'boolean') {
              issues.push({ field: `questions[${idx}].options[${oidx}].isCorrect`, message: 'isCorrect must be a boolean' });
            }
          });
        }
      } else if (q.options && q.options.length > 0) {
        // Warn if options are provided for non-OPTION questions
        issues.push({ 
          field: `questions[${idx}].options`, 
          message: 'Options should only be provided for OPTION type questions' 
        });
      }
      
      // Validate criteria
      if (q.criteria) {
        if (!Array.isArray(q.criteria)) {
          issues.push({ field: `questions[${idx}].criteria`, message: 'criteria must be an array' });
        } else {
          q.criteria.forEach((c, cidx) => {
            if (!isValidCriteriaOperator(c.type)) {
              issues.push({ field: `questions[${idx}].criteria[${cidx}].type`, message: 'criteria.type is invalid' });
            }
            if (!isNonEmptyString(c.value)) {
              issues.push({ field: `questions[${idx}].criteria[${cidx}].value`, message: 'criteria.value must be a non-empty string' });
            }
            if (!['PASS', 'FAIL'].includes(c.effect)) {
              issues.push({ field: `questions[${idx}].criteria[${cidx}].effect`, message: 'effect must be either "PASS" or "FAIL"' });
            }
          });
        }
      }
    }); // This closing bracket was missing
  } 

  if (issues.length > 0) {
    logger.warn('Validation failed', { issues });
    return { success: false, issues };
  }

  try {
    for (const q of questions!) {
      
      const questionEntity = await QuestionService.createQuestion(
        q.typeCode,
        q.questionText,
        data.formId,
        q.interviewId
      );
     

      const questionId = (questionEntity as any)?.questionId;
      if (!isNonEmptyString(questionId)) {
        throw new Error('Question creation did not return a valid questionId');
      }

      // Handle options only for OPTION type questions
      if (q.typeCode === 'MULTIPLE_CHOICE' && Array.isArray(q.options)) {
        for (let i = 0; i < q.options.length; i++) {
          const o = q.options[i];
           await OptionService.createOption(
            o.optionText,
            questionId,
            o.isCorrect,
            i // Use index as displayOrder
          );
          
    
      }
    }
      // Handle criteria
      if (Array.isArray(q.criteria) && q.criteria.length > 0) {
        for (const c of q.criteria) {
          await CriteriaService.createCriterion(c.type, c.value, questionId, c.effect);
          
        }
      }
    }

    return { success: true };
  } catch (err: any) {
    logger.error('Creation failed', { err });
    const parsed = parseDbError(err);
    const responseIssues: FieldIssue[] = Array.isArray(parsed) && parsed.length > 0 ? parsed : [
      { field: 'server', message: 'An unexpected error occurred' },
    ];
    return { success: false, issues: responseIssues };
  }
}