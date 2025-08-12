import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { FormService } from '../../../models/forms/core/form/form.service';

export async function createFormHandler(request: CallableRequest) {
  const issues: FieldIssue[] = [];

  // 1) Auth validation
  if (!request.auth?.uid && process.env.FUNCTIONS_EMULATOR !== 'true') {
    issues.push({ field: 'auth', message: 'Must be signed in' });
    return { success: false, issues };
  }

  // 2) Extract input
  const { projectId, locationId } = request.data || {};
  if (!projectId || !locationId) {
    issues.push({
      field: 'input',
      message: 'Missing required fields: projectId, locationId',
    });
    return { success: false, issues };
  }

  // 3) Call service
  try {
    await FormService.createForm(projectId, locationId);
    return { success: true };
  } catch (err: any) {
    logger.error('Form creation failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
