import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { sendEmail } from '../../services/emailService';
import { FieldIssue } from '../../utils/types';
import { isValidEmail } from '../../utils/validators';

export interface CheckServiceStatusData {
  email: string;
}

export interface CheckServiceStatusResult {
  success: boolean;
  issues?: FieldIssue[];
}

export async function checkServiceStatusHandler(
  request: CallableRequest<CheckServiceStatusData>
): Promise<CheckServiceStatusResult> {
  const issues: FieldIssue[] = [];
  const { email } = request.data;

  if (!email) {
    issues.push({ field: 'email', message: 'Email is required' });
  }

  if (!isValidEmail(request.data.email)) {
    issues.push({ field: 'email', message: 'Invalid email format' });
  }

  if (issues.length > 0) {
    return { success: false, issues };
  }

  try {
    await sendEmail(email, 'SERVICE_STATUS', [
      'User',
      '✅ The service is up and running!',
    ]);

    return { success: true };
  } catch (error: any) {
    logger.error('Service status check failed:', error);
    return {
      success: false,
      issues: [
        {
          field: 'email',
          message: error.message || 'Failed to send status email',
        },
      ],
    };
  }
}
