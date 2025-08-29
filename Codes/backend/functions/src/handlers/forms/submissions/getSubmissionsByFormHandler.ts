import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authorizeUserProjectAccessWorkerFirst } from '../../../utils/authUtils';
import { SubmissionService } from '../../../models/forms/submissions/submission/submission.service';
import { FormService } from '../../../models/forms/core/form/form.service';

export interface GetManualSubmissionsByFormIdData {
  formId: string;
  projectId:string
}

export interface GetManualSubmissionsByFormIdResult {
  success: boolean;
  data?: any | null;
  issues?: FieldIssue[];
}

export async function getSubmissionsByFormHandler(
  request: CallableRequest<GetManualSubmissionsByFormIdData>
): Promise<GetManualSubmissionsByFormIdResult> {
  const issues: FieldIssue[] = [];
  const { formId,projectId } = request.data || {};

  if (!formId) issues.push({ field: 'formId', message: 'formId is required' });
  if(!projectId) issues.push({field:'projectId',message: 'projectId is required'})

  if (issues.length > 0) return { success: false, issues };

  try {
       const auth = await authorizeUserProjectAccessWorkerFirst(request, projectId);
    if (!auth.success) {
      return { success: false, issues: auth.issues };
    }

    // Fetch form to determine its project for authorization
    const form = await FormService.getFormById(formId);
    if (!form) {
      return { success: false, issues: [{ field: 'formId', message: 'Form not found' }] };
    }


    // Authorize user access to the project
 
    // Fetch manual submissions
    const submissions = await SubmissionService.getSubmissionsByForm(formId);

    return { success: true, data: submissions };
  } catch (dbErr: any) {
    logger.error('Get manual submissions by formId failed:', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }
}
