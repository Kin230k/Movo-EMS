import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateUser } from '../../../utils/authUtils';
import { AnswerService } from '../../../models/forms/core/answer/answer.service';
import {
  Answer,
  AnswerType,
  NumericAnswer,
  OptionsAnswer,
  RatingAnswer,
  TextAnswer,
} from '../../../models/forms/core/answer/answer.class';

export interface GetManualAnswersBySubmissionIdData {
  submissionId: string;
  projectId: string;
}

export interface GetManualAnswersBySubmissionIdResult {
  success: boolean;
  data?: any | null;
  issues?: FieldIssue[];
  formTitle?: string | null;
}

export async function getManualAnswersBySubmissionIdHandler(
  request: CallableRequest<GetManualAnswersBySubmissionIdData>
): Promise<GetManualAnswersBySubmissionIdResult> {
  const issues: FieldIssue[] = [];
  const { submissionId } = request.data || {};

  if (!submissionId) {
    issues.push({ field: 'submissionId', message: 'submissionId is required' });
  }

  if (issues.length > 0) {
    return { success: false, issues };
  }

  try {
    // Authorize user access to the project
    const auth = await authenticateUser(request);
    if (!auth.success) {
      return { success: false, issues: auth.issues };
    }

    // Fetch answers with context (includes question text/type and form title)
    const answersWithContext =
      await AnswerService.getQuestionAnswersBySubmissionId(submissionId);

    // Map to the frontend's expected payload shape
    const mapped = answersWithContext.map((ctx) => {
      const ans: Answer = ctx.answer;
      const answerType: AnswerType = (ans as any).getType();

      const base = {
        questionId: (ans as any).questionId as string,
        answerType,
        questionText: ctx.questionText || 'Question',
      };

      if (answerType === 'text') {
        const a = ans as TextAnswer;
        return { ...base, textResponse: a.response };
      }
      if (answerType === 'rating') {
        const a = ans as RatingAnswer;
        return { ...base, rating: a.rating };
      }
      if (answerType === 'numeric') {
        const a = ans as NumericAnswer;
        return { ...base, numericResponse: a.response };
      }
      // options
      const a = ans as OptionsAnswer;
      return {
        ...base,
        optionIds: a.optionIds || [],
        options: a.optionTexts || [],
      };
    });

    const formTitle = answersWithContext?.[0]?.formTitle ?? null;

    return { success: true, data: mapped, formTitle };
  } catch (dbErr: any) {
    logger.error('Get manual answers by submissionId failed:', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }
}
