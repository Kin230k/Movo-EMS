import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { parseDbError } from '../../../utils/dbErrorParser';
import { FormService } from '../../../models/forms/core/form/form.service';
import { authenticateAdmin } from '../../../utils/authUtils';

export interface GetAllFormsRequestData {}

export async function getAllFormsHandler(
  request: CallableRequest<GetAllFormsRequestData>
) {
  const auth = await authenticateAdmin(request);
  if (!auth.success) return auth;

  try {
    const forms = await FormService.getAllForms();
    if (!forms) {
      return {
        success: false,
        issues: [{ field: 'formId', message: 'No forms found' }],
      };
    }
    return { success: true, forms };
  } catch (err: any) {
    logger.error('Form fetch failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
