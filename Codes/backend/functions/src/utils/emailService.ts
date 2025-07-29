// src/utils/emailService.ts
import * as functions from 'firebase-functions';
import nodemailer from 'nodemailer';
import { EMAIL_TEMPLATES } from './emailTemplates';
import { EmailTemplateKey } from './types';
import dotenv from 'dotenv';
dotenv.config();

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, EMAIL_FROM } =
  process.env;

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !EMAIL_FROM) {
  throw new Error(
    'Missing SMTP environment variables: check .env for SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM'
  );
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export const sendEmail = async (
  to: string,
  templateKey: EmailTemplateKey,
  templateData: any[]
): Promise<void> => {
  const template = EMAIL_TEMPLATES[templateKey];
  if (!template) throw new Error(`Template ${templateKey} not found`);

  const { subject, text, html } = template(...templateData);

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });
    functions.logger.log(`Email sent to ${to} via Gmail`);
  } catch (err: any) {
    functions.logger.error('Email send error:', err);
    throw new functions.https.HttpsError('internal', 'Email sending failed');
  }
};
