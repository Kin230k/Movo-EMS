import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { FormService } from '../../../models/forms/core/form/form.service';

export interface UpdateFormRequestData {
  formId?: string | null;
  projectId?: string | null;
  locationId?: string | null;
}

export async function updateFormHandler(
  request: CallableRequest<UpdateFormRequestData>
) {
  const issues: FieldIssue[] = [];

  if (!request.auth?.uid) {
    issues.push({ field: 'auth', message: 'Must be signed in' });
    return { success: false, issues };
  }

  const { formId, projectId, locationId } = request.data || {};
  if (!formId || !projectId || !locationId) {
    issues.push({
      field: 'input',
      message: 'Missing required fields: formId, projectId, locationId',
    });
    return { success: false, issues };
  }

  try {
    await FormService.updateForm(formId, projectId, locationId);
    return { success: true };
  } catch (err: any) {
    logger.error('Form update failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
