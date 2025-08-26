import { Operation } from '../../../operation.enum';

export class Email {
  constructor(
    public title: any,
    public body: any,
    public formId: string,
    public op: Operation,
    public emailId?: string
  ) {}

  get operation(): Operation {
    return this.emailId ? Operation.UPDATE : Operation.CREATE;
  }
}