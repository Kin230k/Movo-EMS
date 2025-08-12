import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { FormService } from '../../../models/forms/core/form/form.service';

export async function getFormHandler(request: CallableRequest) {
  const issues: FieldIssue[] = [];

  const { formId } = request.data || {};
  if (!formId) {
    issues.push({ field: 'input', message: 'Missing required field: formId' });
    return { success: false, issues };
  }

  try {
    const form = await FormService.getFormById(formId);
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
