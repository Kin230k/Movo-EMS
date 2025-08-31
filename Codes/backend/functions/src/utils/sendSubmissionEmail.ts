import { sendEmailManually } from '../services/emailService'; // Adjust path if necessary
import { submissionResult } from './emailTemplates'; // Import the named function

export async function sendSubmissionEmail(
  to: string,
  displayName: string,
  status: 'PASSED' | 'REJECTED' | 'MANUAL_REVIEW',
  details?: string,
  actionLink?: string,
  confirmLink?: string,
  userId?: string
): Promise<void> {
  try {
    // Call submissionResult to generate email content
    const { subject, html } = await submissionResult(
      displayName,
      status,
      details,
      actionLink,
      confirmLink,
      userId
    );

    // Use sendEmailManually to send the email with the generated content
    await sendEmailManually(to, subject, html);
    
  } catch (error) {
    console.error('Failed to send submission email:', error);
    throw error;
  }
}