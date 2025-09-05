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
export async function getQuestionsByInterviewHandler(
  request: CallableRequest<GetQuestionsByInterviewData>
) {
  const auth = await authenticateUser(request);
  if (!auth.success) return auth;

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
    

    // For simplicity, let's use the first form

    // Get questions for this form
    const questions = await QuestionService.getAllQuestionsByInterviewId(interviewId!);
    
    // For each question, get its options
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

    return { success: true, questions: questionsWithOptions };

  } catch (err: any) {
    logger.error('Fetching interview questions failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}


