import { EmailTemplate } from './types';

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
