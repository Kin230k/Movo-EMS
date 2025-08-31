import * as logger from 'firebase-functions/logger';
import { QuestionService } from '../../../models/forms/core/question/question.service';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateUser } from '../../../utils/authUtils';
import { CallableRequest } from 'firebase-functions/https';
import { FieldIssue } from '../../../utils/types';
import { FormService } from '../../../models/forms/core/form/form.service';
import { OptionService } from '../../../models/forms/core/option/option.service';

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

interface FormWithQuestionsResponse {
  formId: string;
  formTitle: string;
  formLanguage: string;
  questions: QuestionResponse[];
}

interface GetFormQuestionsByProjectOrLocationData {
  projectId?: string;
  locationId?: string;
}
export async function getFormQuestionsByProjectOrLocationHandler(
  request: CallableRequest<GetFormQuestionsByProjectOrLocationData>
) {
  const auth = await authenticateUser(request);
  if (!auth.success) return auth;

  const { projectId, locationId } = request.data;
  const issues: FieldIssue[] = [];

  if (!projectId && !locationId) {
    issues.push({
      field: 'projectId/locationId',
      message: 'Either projectId or locationId is required',
    });
    return { success: false, issues };
  }

  try {
    let formId: string | null = null;
    let forms: any[] = [];

    // Get forms by project or location
    if (projectId) {
      forms = await FormService.getFormsByProject(projectId);
    } else if (locationId) {
      forms = await FormService.getFormsByLocation(locationId);
    }

    if (forms.length === 0) {
      return {
        success: false,
        issues: [{
          field: projectId ? 'projectId' : 'locationId',
          message: 'No forms found for the given input',
        }],
      };
    }

    // For simplicity, let's use the first form
    const form = forms[0];
    formId = form.formId!;

    // Get questions for this form
    const questions = await QuestionService.getAllQuestionsByFormId(formId!);
    
    // For each question, get its options
    const questionsWithOptions: QuestionResponse[] = await Promise.all(
      questions.map(async (question) => {
        const options = await OptionService.getOptionsByQuestion(question.questionId!);
        return {
          questionId: question.questionId!,
          typeCode: question.typeCode,
          questionText: question.questionText,
          options: options!.map(option => ({
            optionId: option.optionId!,
            optionText: option.optionText
          }))
        };
      })
    );

    // Structure the response
    const response: FormWithQuestionsResponse = {
      formId: form.formId!,
      formTitle: form.formTitle,
      formLanguage: form.formLanguage,
      questions: questionsWithOptions
    };

    return { success: true, data: response };
  } catch (err: any) {
    logger.error('Fetching form with questions failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
