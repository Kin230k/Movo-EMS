import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { sendEmail } from '../services/emailService';

export interface CheckServiceStatusData {
  email: string;
}

export interface CheckServiceStatusResult {
  status: 'ok';
  message: string;
}

export async function checkServiceStatusHandler(
  request: CallableRequest<CheckServiceStatusData>
): Promise<CheckServiceStatusResult> {
  const { email } = request.data;

  if (!email) {
    throw new HttpsError('invalid-argument', 'Email is required');
  }

  try {
    await sendEmail(email, 'SERVICE_STATUS', [
      'User',
      '✅ The service is up and running!',
    ]);

    return {
      status: 'ok',
      message: 'Email sent successfully',
    };
  } catch (error: any) {
    logger.error('Service status check failed:', error);
    throw new HttpsError('internal', 'Failed to send status email');
  }
}
