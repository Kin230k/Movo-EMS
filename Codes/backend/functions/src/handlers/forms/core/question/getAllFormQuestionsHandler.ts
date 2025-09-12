import * as logger from 'firebase-functions/logger';
import { QuestionService } from '../../../../models/forms/core/question/question.service';
import { parseDbError } from '../../../../utils/dbErrorParser';
import { authenticateUser } from '../../../../utils/authUtils';
import { CallableRequest } from 'firebase-functions/https';
import { FieldIssue } from '../../../../utils/types';
import { OptionService } from '../../../../models/forms/core/option/option.service';
import { AdminService } from '../../../../models/auth/admin/admin.service';
import { ClientService } from '../../../../models/project/client/client.service';

interface OptionResponse {
  optionId: string;
  optionText: string;
  isCorrect?: boolean;
}

interface CriteriaResponse {
  criterionId: string;
  type: string;
  value: string;
  effect?: string;
}

interface QuestionResponse {
  questionId: string;
  typeCode: string;
  questionText: string;
  options: OptionResponse[];
  criteria?: CriteriaResponse[];
}

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
    const callerUuid = (auth as any).callerUuid;
    const [adminRecord, clientRecord] = await Promise.all([
      AdminService.getAdminById(callerUuid),
      ClientService.getClientById(callerUuid),
    ]);
    const isPrivileged = !!adminRecord || !!clientRecord;

    const questions: any[] = await QuestionService.getAllQuestionsByFormId(
      formId
    );

    const questionsWithExtras: QuestionResponse[] = await Promise.all(
      questions.map(async (q) => {
        const options = await OptionService.getOptionsByQuestion(q.questionId!);
        const base: QuestionResponse = {
          questionId: q.questionId!,
          typeCode: q.typeCode,
          questionText: q.questionText,
          options:
            options?.map((o) => {
              const baseOpt: OptionResponse = {
                optionId: o.optionId!,
                optionText: o.optionText,
              };
              if (isPrivileged) baseOpt.isCorrect = o.isCorrect;
              return baseOpt;
            }) || [],
        };
        if (isPrivileged) {
          const rawCriteria: any[] = Array.isArray(q.criteria)
            ? q.criteria
            : [];
          base.criteria = rawCriteria.map((c) => ({
            criterionId: c.criterionId,
            type: c.type,
            value: c.value,
            effect: c.effect,
          }));
        }
        return base;
      })
    );

    return { success: true, questions: questionsWithExtras };
  } catch (err: any) {
    logger.error('Fetching all questions failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
