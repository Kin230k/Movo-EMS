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
  projectId?: string | null;
  locationId?: string | null;
}

export async function createFormHandler(
  request: CallableRequest<CreateFormRequestData>
) {
  const issues: FieldIssue[] = [];

  const auth = await authenticateClient(request);
  if (!auth.success) return auth;

  // cast request.data to our interface for safer access
  const data = request.data;

  // 2) Extract input (defensive checks)
  const projectId =
    typeof data.projectId === 'string' ? data.projectId.trim() : null;
  const locationId =
    typeof data.locationId === 'string' ? data.locationId.trim() : null;

  if (!projectId) {
    issues.push({
      field: 'projectId',
      message: 'projectId is required and must be a non-empty string',
    });
  }
  if (!locationId) {
    issues.push({
      field: 'locationId',
      message: 'locationId is required and must be a non-empty string',
    });
  }
  if (issues.length > 0) {
    logger.warn('Validation failed for createFormHandler input', { issues });
    return { success: false, issues };
  }

  // 3) Call service
  try {
    await FormService.createForm(projectId, locationId);
    return { success: true };
  } catch (err: any) {
    logger.error('Form creation failed', { err, projectId, locationId });

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
