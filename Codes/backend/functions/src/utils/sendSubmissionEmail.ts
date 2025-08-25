import { sendEmail } from '../services/emailService';
import { EmailTemplateKey } from './types';

export async function sendSubmissionEmail(
  to: string,
  displayName: string,
  status: 'PASSED' | 'REJECTED' | 'MANUAL_REVIEW',
  details?: string,
  actionLink?: string,
  confirmLink?: string
): Promise<void> {
  try {
    await sendEmail(to, 'SUBMISSION_RESULT' as EmailTemplateKey, [
      displayName,
      status,
      details,
      actionLink,
      confirmLink,
    ]);
  } catch (error) {
    console.error('Failed to send submission email:', error);
    throw error;
  }
}
