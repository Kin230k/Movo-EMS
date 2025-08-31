import { Operation } from '../../../operation.enum';

export class Email {
  constructor(
    public title: string,
    public body: string,
    public formId: string,
    public emailId?: string
  ) {}

  get operation(): Operation {
    return this.emailId ? Operation.UPDATE : Operation.CREATE;
  }
}