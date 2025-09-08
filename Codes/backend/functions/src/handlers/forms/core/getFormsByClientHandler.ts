import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { FormService } from '../../../models/forms/core/form/form.service';
import { authenticateClient } from '../../../utils/authUtils';

export interface GetFormsByClientRequestData {}

export async function getFormsByClientHandler(
  request: CallableRequest<GetFormsByClientRequestData>
) {
  const issues: FieldIssue[] = [];

  const auth = await authenticateClient(request);
  if (!auth.success) return auth;

  const clientId = auth.callerUuid;
  if (!clientId) {
    issues.push({
      field: 'input',
      message: 'Missing required field: clientId',
    });
    return { success: false, issues };
  }

  try {
    const forms = await FormService.getFormsByClient(clientId);
    if (!forms) {
      return {
        success: false,
        issues: [
          { field: 'clientId', message: 'No forms found for this client' },
        ],
      };
    }
    return { success: true, forms };
  } catch (err: any) {
    logger.error('Form fetch failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
