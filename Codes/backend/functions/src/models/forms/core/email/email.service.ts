import emailMapper from './email.mapper';
import { Email } from './email.class';

export class EmailService {
  constructor() {}

  static async createEmail(
    title: string,
    body: string,
    formId: string
  ): Promise<void> {
    const entity = new Email(title, body, formId);
    await emailMapper.save(entity);
  }

  static async updateEmail(
    emailId: string,
    title: string,
    body: string,
    formId: string
  ): Promise<void> {
    const entity = new Email(title, body, formId, emailId);
    await emailMapper.save(entity);
  }

  static async getEmailById(id: string): Promise<Email | null> {
    return await emailMapper.getById(id);
  }

  static async getAllEmails(): Promise<Email[]> {
    return await emailMapper.getAll();
  }

  static async getEmailsByFormId(formId: string): Promise<Email[]> {
    return await emailMapper.getByFormId(formId);
  }

  static async deleteEmail(id: string): Promise<void> {
    await emailMapper.delete(id);
  }
}