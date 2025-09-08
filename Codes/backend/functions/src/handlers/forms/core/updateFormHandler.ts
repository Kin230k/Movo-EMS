import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { FormService } from '../../../models/forms/core/form/form.service';
import { authenticateClient } from '../../../utils/authUtils';
export interface UpdateFormRequestData {
  formId?: string | null;
  projectId?: string | null;
  locationId?: string | null;
  formLanguage?: string | null;
  formTitle?: string | null;
}

export async function updateFormHandler(
  request: CallableRequest<UpdateFormRequestData>
) {
  const issues: FieldIssue[] = [];

  const auth = await authenticateClient(request);
  if (!auth.success) return auth;

  const { formId, projectId, locationId, formLanguage, formTitle } = request.data || {};

  // Validate Form ID
  if (!formId) {
    issues.push({ field: 'formId', message: 'Form ID is required' });
  }

  // Validate XOR for projectId and locationId
  const hasProject = !!projectId;
  const hasLocation = !!locationId;
  
  if (hasProject && hasLocation) {
    issues.push({
      field: 'projectId locationId',
      message: 'Provide either Project ID or Location ID, not both',
    });
  } else if (!hasProject && !hasLocation) {
    issues.push({
      field: 'projectId locationId',
      message: 'Project ID or Location ID is required',
    });
  }

  // Validate form language and title
  if (!formLanguage) {
    issues.push({
      field: 'formLanguage',
      message: 'Form language is required',
    });
  }

  if (!formTitle) {
    issues.push({
      field: 'formTitle',
      message: 'Form title is required',
    });
  }

  if (issues.length > 0) {
    return { success: false, issues };
  }

  try {
    await FormService.updateForm(
      formId!,
      hasProject ? projectId! : null,
      hasLocation ? locationId! : null,
      formLanguage!,
      formTitle!
    );
    return { success: true };
  } catch (err: any) {
    logger.error('Form update failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}