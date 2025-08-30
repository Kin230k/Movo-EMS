import * as logger from 'firebase-functions/logger';
import { QuestionService } from '../../../models/forms/core/question/question.service';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateUser } from '../../../utils/authUtils';
import { CallableRequest } from 'firebase-functions/https';
import { FieldIssue } from '../../../utils/types';
import { getAllFormQuestionsHandler } from './question/getAllFormQuestionsHandler';
import { FormService } from '../../../models/forms/core/form/form.service';

interface GetFormQuestionsByProjectOrLocationData {
  projectId?: string;
  locationId?: string;
}

export async function getFormQuestionsByProjectOrlocationHandler(
  request: CallableRequest<GetFormQuestionsByProjectOrLocationData>
) {
  const auth = await authenticateUser(request);
  if (!auth.success) return auth;

  const { projectId, locationId } = request.data;
  const issues: FieldIssue[] = [];

  // ✅ Validation: require one of projectId or locationId
  if (!projectId && !locationId) {
    issues.push({
      field: 'projectId/locationId',
      message: 'Either projectId or locationId is required',
    });
    return { success: false, issues };
  }

  try {
    let formId: string | null = null;

    if (projectId) {
      const form = (await FormService.getFormsByProject(projectId));
      formId=form
    } else if (locationId) {
      formId = await QuestionService.getFormIdByLocationId(locationId);
    }

    if (!formId) {
      return {
        success: false,
        issues: [
          {
            field: projectId ? 'projectId' : 'locationId',
            message: 'No form found for the given input',
          },
        ],
      };
    }

    // 🔄 Reuse existing handler for consistency
    return await getAllFormQuestionsHandler({
      ...request,
      data: { formId },
    } as CallableRequest<{ formId: string }>);
  } catch (err: any) {
    logger.error('Fetching questions failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
