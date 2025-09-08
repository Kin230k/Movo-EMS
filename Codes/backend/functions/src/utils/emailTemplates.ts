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
  status: 'ACCEPTED' | 'REJECTED' | 'MANUAL_REVIEW',
  details?: string,
  actionLink?: string,
  confirmLink?: string,
  userId?: string
): Promise<{ subject: string; text: string; html: string; attachments?: any[] }> {
  let subject = '';
  let text = '';
  let html = '';
  let attachments: any[] | undefined;

  switch (status) {
    case 'ACCEPTED': {
      let additionalHtml = '';
      if (userId) {
        // create data URL
        const qrDataUrl = await QRCode.toDataURL(userId);
        // convert to buffer
        const base64 = qrDataUrl.split(',')[1];
        const buffer = Buffer.from(base64, 'base64');

        // choose a CID (must be unique per message; using userId helps)
        const cid = `qr-${userId}@submission`;

        // prepare attachment for nodemailer
        attachments = [
          {
            filename: 'attendance-qr.png',
            content: buffer,
            contentType: 'image/png',
            cid, // <--- this is the important part
          },
        ];

        // embed via CID
        additionalHtml = `<p>Scan this barcode to create attendance:</p><img src="cid:${cid}" alt="Attendance QR" style="width:200px;height:200px;" />`;
      }

      subject = '🎉 Your Submission Has Been Approved';
      text = `Hi ${displayName},\n\nCongratulations! Your submission has been approved.${
        details ? `\n\nDetails: ${details}` : ''
      }${confirmLink ? `\n\nConfirm: ${confirmLink}` : '\n\nNo further action required.'}\n\nThank you!`;

      html = `<p>Hi ${displayName},</p>
              <p><strong>Congratulations! Your submission has been approved.</strong></p>
              ${details ? `<p>Details: ${details}</p>` : ''}
              ${confirmLink ? `<p><a href="${confirmLink}">Confirm Acceptance</a></p>` : '<p>No further action required.</p>'}
              ${additionalHtml}
              <p>Thank you for your contribution!</p>`;
      break;
    }

    case 'REJECTED':
      subject = 'Submission Status Update';
      text = `Hi ${displayName},\n\nAfter careful review, your submission was not approved.${
        details ? `\n\nFeedback: ${details}` : ''
      }${actionLink ? `\n\nDetails: ${actionLink}` : ''}\n\nIf you have any questions, reply to this email.`;
      html = `<p>Hi ${displayName},</p>
              <p><strong>After careful review, your submission was not approved.</strong></p>
              ${details ? `<p>Feedback: ${details}</p>` : ''}
              ${actionLink ? `<p><a href="${actionLink}">View Details</a></p>` : ''}
              <p>If you have any questions, reply to this email.</p>`;
      break;

    case 'MANUAL_REVIEW':
      subject = 'Submission Under Review';
      text = `Hi ${displayName},\n\nYour submission is under manual review.${details ? `\n\nInfo: ${details}` : ''}\n\nWe will notify you.`;
      html = `<p>Hi ${displayName},</p>
              <p>Your submission is currently <strong>under manual review</strong>.</p>
              ${details ? `<p>Additional: ${details}</p>` : ''}
              <p>We will notify you once review is complete.</p>`;
      break;
  }

  return { subject, text, html, attachments };
}