import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../../utils/types';
import { parseDbError } from '../../../../utils/dbErrorParser';
import { authenticateClient } from '../../../../utils/authUtils';
import { EmailService } from '../../../../models/forms/core/email/email.service';

export interface GetEmailsByFormRequestData {
  formId: string;
}

export interface GetEmailsByFormResult {
  success: boolean;
  emails?: any[] | null;
  issues?: FieldIssue[];
}

export async function getEmailsByFormHandler(
  request: CallableRequest<GetEmailsByFormRequestData>
): Promise<GetEmailsByFormResult> {
  const issues: FieldIssue[] = [];
  const { formId } = request.data || {};

  if (!formId) {
    issues.push({
      field: 'formId',
      message: 'formId is required',
    });
  }

  if (issues.length > 0) {
    return { success: false, issues };
  }

  const auth = await authenticateClient(request);
  if (!auth.success) {
    return { success: false, issues: auth.issues };
  }

  try {
    const emails = await EmailService.getEmailsByFormId(formId);
    return { success: true, emails };
  } catch (err: any) {
    logger.error('Email fetch by form failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
