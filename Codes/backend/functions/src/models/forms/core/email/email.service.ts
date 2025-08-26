import emailMapper from './email.mapper';
import { Email } from './email.class';
import { Operation } from '../../../operation.enum';

export class EmailService {
  constructor() {}

  static async createEmail(
    title: any,
    body: any,
    formId: string
  ): Promise<void> {
    const entity = new Email(title, body, formId, Operation.CREATE);
    await emailMapper.save(entity);
  }

  static async updateEmail(
    emailId: string,
    title: any,
    body: any,
    formId: string
  ): Promise<void> {
    const entity = new Email(title, body, formId, Operation.UPDATE, emailId);
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