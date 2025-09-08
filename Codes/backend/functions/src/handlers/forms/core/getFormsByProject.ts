import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { FormService } from '../../../models/forms/core/form/form.service';
import { authenticateClient } from '../../../utils/authUtils';
export interface GetFormsByProjectRequestData {
  projectId: string;
}
export async function getFormsByProjectHandler(
  request: CallableRequest<GetFormsByProjectRequestData>
) {
  const issues: FieldIssue[] = [];

  const auth = await authenticateClient(request);
  if (!auth.success) return auth;

  const { projectId } = request.data || {};
  if (!projectId) {
    issues.push({
      field: 'input',
      message: 'Missing required field: projectId',
    });
    return { success: false, issues };
  }

  try {
    const forms = await FormService.getFormsByProject(projectId);
    if (!forms) {
      return {
        success: false,
        issues: [{ field: 'formId', message: 'Form not found' }],
      };
    }
    return { success: true, forms };
  } catch (err: any) {
    logger.error('Form fetch failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
