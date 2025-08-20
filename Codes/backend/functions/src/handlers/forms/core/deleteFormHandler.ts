import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { FormService } from '../../../models/forms/core/form/form.service';
import { authenticateClient } from '../../../utils/authUtils';

/**
 * Shape of the incoming request.data for deleteFormHandler.
 */
export interface DeleteFormRequestData {
  formId?: string | null;
}

type HandlerResponse =
  | { success: true }
  | { success: false; issues: FieldIssue[] };

export async function deleteFormHandler(
  request: CallableRequest
): Promise<HandlerResponse> {
  const issues: FieldIssue[] = [];

  logger.info('deleteFormHandler called', {
    uid: request.auth?.uid ?? null,
    timestamp: new Date().toISOString(),
  });

  const auth = await authenticateClient(request);
  if (!auth.success) return auth;

  // 2) Cast and validate input
  const data = (request.data ?? {}) as DeleteFormRequestData;
  const formId = data.formId ? data.formId.trim() : null;

  if (!formId) {
    issues.push({
      field: 'formId',
      message: 'Missing required field: formId (non-empty string expected)',
    });
    logger.warn('Validation failed for deleteFormHandler input', { issues });
    return { success: false, issues };
  }

  // 3) Call service
  try {
    await FormService.deleteForm(formId);
    logger.info('Form deleted', { formId, uid: request.auth?.uid });
    return { success: true };
  } catch (err: any) {
    logger.error('Form deletion failed', { err, formId });
    const parsed = parseDbError(err);
    const responseIssues: FieldIssue[] =
      Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : [
            {
              field: 'server',
              message: 'An unexpected error occurred while deleting the form',
            },
          ];

    return { success: false, issues: responseIssues };
  }
}
