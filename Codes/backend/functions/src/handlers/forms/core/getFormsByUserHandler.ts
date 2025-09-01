import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { FormService } from '../../../models/forms/core/form/form.service';
import { authenticateUser } from '../../../utils/authUtils';
export interface GetFormByUserRequestData {
  userId?: string | null;
}
export async function getFormByUserHandler(
  request: CallableRequest<GetFormByUserRequestData>
) {
  const issues: FieldIssue[] = [];

  const auth = await authenticateUser(request);
  if (!auth.success) return auth;

  const { userId } = request.data || {};
  if (!userId) {
    issues.push({ field: 'input', message: 'Missing required field: userId' });
    return { success: false, issues };
  }

  try {
    const form = await FormService.getFormsByUser(userId);
    if (!form) {
      return {
        success: false,
        issues: [{ field: 'formId', message: 'Form not found' }],
      };
    }
    return { success: true, form };
  } catch (err: any) {
    logger.error('Form fetch failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
