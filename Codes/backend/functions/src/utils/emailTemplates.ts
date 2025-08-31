import { EmailTemplate } from './types';
import QRCode from 'qrcode';

export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  VERIFICATION: (displayName: string, link: string) => ({
    subject: 'Verify your email address',
    text: `Hi ${displayName},\n\nPlease verify your email by clicking:\n${link}`,
    html: `<p>Hi ${displayName},</p><p>Please verify your email by clicking:</p><a href="${link}">Verify Email</a>`,
  }),

  PASSWORD_RESET: (displayName: string, link: string) => ({
    subject: 'Password Reset Request',
    text: `Hi ${displayName},\n\nReset your password:\n${link}`,
    html: `<p>Hi ${displayName},</p><p>Reset your password:</p><a href="${link}">Reset Password</a>`,
  }),

  LOGIN_ALERT: (displayName: string, deviceInfo: string) => ({
    subject: 'New Login Alert',
    text: `Hi ${displayName},\n\nNew login from:\n${deviceInfo}`,
    html: `<p>Hi ${displayName},</p><p>New login from:</p><strong>${deviceInfo}</strong>`,
  }),

  EMAIL_CHANGE: (displayName: string, newEmail: string) => ({
    subject: 'Email Address Changed',
    text: `Hi ${displayName},\n\nYour email was changed to:\n${newEmail}`,
    html: `<p>Hi ${displayName},</p><p>Your email was changed to:</p><strong>${newEmail}</strong>`,
  }),

  SERVICE_STATUS: (displayName: string, message: string) => ({
    subject: 'Service Status Check',
    text: `Hi ${displayName},\n\n${message}`,
    html: `<p>Hi ${displayName},</p><p>${message}</p>`,
  }),
    

};

export async function submissionResult(
  displayName: string,
  status: 'PASSED' | 'REJECTED' | 'MANUAL_REVIEW',
  details?: string,
  actionLink?: string,
  confirmLink?: string
  ,userId?: string
)  {
  let subject = '';
  let text = '';
  let html = '';

  switch (status) {
      case 'PASSED': {
        let additionalHtml = '';
        if (userId) {
          const qrDataUrl = await QRCode.toDataURL(userId);
          const qrImage = `<img src="${qrDataUrl}" alt="Attendance Barcode" style="width: 200px; height: 200px;" />`;
          additionalHtml = `<p>Congratulations! Scan this barcode to create attendance:</p>${qrImage}`;
        }

        subject = '🎉 Your Submission Has Been Approved';
        text = `Hi ${displayName},\n\nCongratulations! Your submission has been approved.${
          details ? `\n\nDetails: ${details}` : ''
        }${
          confirmLink
            ? `\n\nPlease confirm your acceptance by clicking: ${confirmLink}`
            : '\n\nNo further action is required at this time.'
        }\n\nThank you for your contribution!`;

        html = `<p>Hi ${displayName},</p>
                <p><strong>Congratulations! Your submission has been approved.</strong></p>
                ${details ? `<p>Details: ${details}</p>` : ''}
                ${
                  confirmLink
                    ? `<p>Please confirm your acceptance by clicking: <a href="${confirmLink}">Confirm Acceptance</a></p>`
                    : '<p>No further action is required at this time.</p>'
                }
                ${additionalHtml}
                <p>Thank you for your contribution!</p>`;
        break;
      }

    case 'REJECTED':
      subject = 'Submission Status Update';
      text = `Hi ${displayName},\n\nAfter careful review, your submission was not approved.${details ? `\n\nFeedback: ${details}` : ''}${actionLink ? `\n\nYou can view more details or submit a new application here: ${actionLink}` : ''}\n\nIf you have any questions, please reply to this email.`;
      html = `<p>Hi ${displayName},</p>
              <p><strong>After careful review, your submission was not approved.</strong></p>
              ${details ? `<p>Feedback: ${details}</p>` : ''}
              ${actionLink ? `<p>You can view more details or submit a new application here: <a href="${actionLink}">View Details</a></p>` : ''}
              <p>If you have any questions, please reply to this email.</p>`;
      break;

    case 'MANUAL_REVIEW':
      subject = 'Submission Under Review';
      text = `Hi ${displayName},\n\nYour submission is currently under manual review by our team.${details ? `\n\nAdditional information: ${details}` : ''}\n\nWe will notify you once the review is complete. This process typically takes 3-5 business days.`;
      html = `<p>Hi ${displayName},</p>
              <p>Your submission is currently <strong>under manual review</strong> by our team.</p>
              ${details ? `<p>Additional information: ${details}</p>` : ''}
              <p>We will notify you once the review is complete. This process typically takes 3-5 business days.</p>`;
      break;
  }

  return { subject, text, html };
} 