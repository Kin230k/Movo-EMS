import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { FormService } from '../../../models/forms/core/form/form.service';
import { authenticateClient } from '../../../utils/authUtils';

/**
 * Shape of the incoming request.data for createFormHandler.
 * Both fields are optional on the raw payload because request.data can be anything,
 * but validation below ensures they become non-empty strings.
 */
export interface CreateFormRequestData {
  projectId?: string;
  locationId?: string;
  formLanguage?: string;
  formTitle?: string;
}

export async function createFormHandler(
  request: CallableRequest<CreateFormRequestData>
) {
  const issues: FieldIssue[] = [];

  const auth = await authenticateClient(request);
  if (!auth.success) return auth;

  const data = request.data;

  const projectId = typeof data.projectId === 'string' ? data.projectId.trim() : null;
  const locationId = typeof data.locationId === 'string' ? data.locationId.trim() : null;
  const formLanguage = typeof data.formLanguage === 'string' ? data.formLanguage.trim() : '';
  const formTitle = typeof data.formTitle === 'string' ? data.formTitle.trim() : '';

  // Validation
  if ((locationId && projectId) || (!locationId && !projectId)) {
    issues.push({
      field: 'projectId locationId',
      message: 'projectId or locationId only one of them needed',
    });
  }

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
    logger.warn('Validation failed for createFormHandler input', { issues });
    return { success: false, issues };
  }

  try {
    await FormService.createForm(projectId, locationId, formLanguage, formTitle);
    return { success: true };
  } catch (err: any) {
    logger.error('Form creation failed', { err, projectId, locationId, formLanguage, formTitle });

    const parsed = parseDbError(err);
    const responseIssues: FieldIssue[] =
      Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : [
            {
              field: 'server',
              message: 'An unexpected error occurred while creating the form',
            },
          ];

    return { success: false, issues: responseIssues };
  }
}
