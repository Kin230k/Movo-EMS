// wherever you call the email sending (e.g., services/sendSubmissionEmail.ts)
import { sendEmailManually } from '../services/emailService';
import { submissionResult } from './emailTemplates';

export async function sendSubmissionEmail(
  to: string,
  displayName: string,
  status: 'ACCEPTED' | 'REJECTED' | 'MANUAL_REVIEW',
  details?: string,
  actionLink?: string,
  confirmLink?: string,
  userId?: string
): Promise<string> {
  try {
    const { subject, html, attachments } = await submissionResult(
      displayName,
      status,
      details,
      actionLink,
      confirmLink,
      userId
    );

    // pass attachments to the mailer
    await sendEmailManually(to, subject, html, attachments);
    return html;
  } catch (error) {
    console.error('Failed to send submission email:', error);
    throw error;
  }
}
