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
  // isCorrect is conditionally included for admin/client callers
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
  // criteria is conditionally included for admin/client callers
  criteria?: CriteriaResponse[];
}

interface GetQuestionsByInterviewData {
  interviewId: string;
}

interface GetQuestionsByInterviewResponse {
  interviewTitle: string | null;
  questions: QuestionResponse[];
}

export async function getQuestionsByInterviewHandler(
  request: CallableRequest<GetQuestionsByInterviewData>
): Promise<
  | { success: false; issues: FieldIssue[] }
  | ({ success: true } & GetQuestionsByInterviewResponse)
> {
  const auth = await authenticateUser(request);
  if (!auth.success) return auth as { success: false; issues: FieldIssue[] };

  const { interviewId } = request.data;
  const issues: FieldIssue[] = [];

  if (!interviewId) {
    issues.push({
      field: 'interviewId',
      message: 'interviewId is required',
    });
    return { success: false, issues };
  }

  try {
    // Determine caller privileges (admin or client)
    const callerUuid = auth.callerUuid;
    const [adminRecord, clientRecord] = await Promise.all([
      AdminService.getAdminById(callerUuid),
      ClientService.getClientById(callerUuid),
    ]);
    const isPrivileged = !!adminRecord || !!clientRecord;

    const { interviewTitle, questions } =
      await QuestionService.getAllQuestionsByInterviewId(interviewId!);

    const questionsWithOptions: QuestionResponse[] = await Promise.all(
      questions.map(async (question: any) => {
        const options = await OptionService.getOptionsByQuestion(
          question.questionId!
        );
        const base: QuestionResponse = {
          questionId: question.questionId!,
          typeCode: question.typeCode,
          questionText: question.questionText,
          options:
            options?.map((option) => {
              const baseOption: OptionResponse = {
                optionId: option.optionId!,
                optionText: option.optionText,
              };
              if (isPrivileged) {
                baseOption.isCorrect = option.isCorrect;
              }
              return baseOption;
            }) || [],
        };

        if (isPrivileged) {
          const rawCriteria: any[] = Array.isArray(question.criteria)
            ? question.criteria
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

    return { success: true, interviewTitle, questions: questionsWithOptions };
  } catch (err: any) {
    logger.error('Fetching interview questions failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
