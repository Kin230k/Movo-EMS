import * as logger from 'firebase-functions/logger';
import { QuestionService } from '../../../../models/forms/core/question/question.service';
import { parseDbError } from '../../../../utils/dbErrorParser';
import { authenticateUser } from '../../../../utils/authUtils';
import { CallableRequest } from 'firebase-functions/https';
import { FieldIssue } from '../../../../utils/types';
import { OptionService } from '../../../../models/forms/core/option/option.service';

interface OptionResponse {
  optionId: string;
  optionText: string;
}

interface QuestionResponse {
  questionId: string;
  typeCode: string;
  questionText: string;
  options: OptionResponse[];
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
    const { interviewTitle, questions } = await QuestionService.getAllQuestionsByInterviewId(interviewId!);
    
    const questionsWithOptions: QuestionResponse[] = await Promise.all(
      questions.map(async (question) => {
        const options = await OptionService.getOptionsByQuestion(question.questionId!);
        return {
          questionId: question.questionId!,
          typeCode: question.typeCode,
          questionText: question.questionText,
          options: options?.map((option) => ({
            optionId: option.optionId!,
            optionText: option.optionText,
          })) || []
        };
      })
    );

    return { success: true, interviewTitle, questions: questionsWithOptions };

  } catch (err: any) {
    logger.error('Fetching interview questions failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}