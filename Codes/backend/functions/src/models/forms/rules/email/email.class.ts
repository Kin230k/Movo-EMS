import { Operation } from '../../../operation.enum';
import { Multilingual } from '../../../multilingual.type';

export class Email {
  constructor(
    public title: Multilingual,
    public body: Multilingual,
    public formId: string,
    public op :Operation,
    public emailId?: string
  ) {}

  get operation(): Operation {
    return this.emailId ? Operation.UPDATE : Operation.CREATE;
  }
}