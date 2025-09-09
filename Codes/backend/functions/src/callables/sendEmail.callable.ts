import {
  CallableRequest,
  HttpsError,
  onCall,
} from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';
import { sendEmailManually } from '../services/emailService';
import { FieldIssue } from '../utils/types';
export const sendEmail = onCall(
  (
    request: CallableRequest<{ email: string; subject: string; body: string }>
  ) => {
    const issues: FieldIssue[] = [];
    const { email, subject, body } = request.data;
    if (!email) {
      issues.push({ field: 'email', message: 'Email is required' });
    }
    if (!subject) {
      issues.push({ field: 'subject', message: 'Subject is required' });
    }
    if (!body) {
      issues.push({ field: 'body', message: 'Body is required' });
    }
    if (issues.length > 0) {
      throw new HttpsError('invalid-argument', 'Invalid arguments', { issues });
    }
    try {
      sendEmailManually(email, subject, body);
      return { success: true };
    } catch (error) {
      logger.error('Error sending email', error);
      throw new HttpsError('internal', 'Error sending email', { error });
    }
  }
);
