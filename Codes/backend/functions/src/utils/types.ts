export type EmailTemplateKey =
  | 'VERIFICATION'
  | 'PASSWORD_RESET'
  | 'LOGIN_ALERT'
  | 'EMAIL_CHANGE'
  | 'SERVICE_STATUS';

export type EmailTemplate = (...args: any[]) => {
  subject: string;
  text: string;
  html: string;
};

export type AuthUser = {
  uid: string;
  email?: string;
  displayName?: string;
};

export type PasswordResetData = {
  email: string;
};

export type LoginAlertData = {
  device?: string;
};
export interface FieldIssue {
  field: string;
  message: string;
}
