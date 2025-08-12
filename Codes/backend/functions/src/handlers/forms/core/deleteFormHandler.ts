import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { FormService } from '../../../models/forms/core/form/form.service';

export async function deleteFormHandler(request: CallableRequest) {
  const issues: FieldIssue[] = [];

  if (!request.auth?.uid && process.env.FUNCTIONS_EMULATOR !== 'true') {
    issues.push({ field: 'auth', message: 'Must be signed in' });
    return { success: false, issues };
  }

  const { formId } = request.data || {};
  if (!formId) {
    issues.push({ field: 'input', message: 'Missing required field: formId' });
    return { success: false, issues };
  }

  try {
    await FormService.deleteForm(formId);
    return { success: true };
  } catch (err: any) {
    logger.error('Form deletion failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
