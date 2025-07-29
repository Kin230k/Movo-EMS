import * as functions from 'firebase-functions';
import { sendEmail } from '../utils/emailService';

export interface CheckServiceStatusData {
  email: string;
}

export interface CheckServiceStatusResult {
  status: 'ok';
  message: string;
}

export async function checkServiceStatusHandler(
  data: CheckServiceStatusData,
  context: functions.https.CallableContext
): Promise<CheckServiceStatusResult> {
  // (You could inspect context.auth here if you ever want to restrict access)

  // 1) Validate input
  const { email } = data;
  if (!email) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email is required'
    );
  }

  // 2) Send status email
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
    functions.logger.error('Service status check failed:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send status email'
    );
  }
}
