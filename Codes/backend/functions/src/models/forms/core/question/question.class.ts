import { Operation } from '../../../operation.enum';
import { Multilingual } from '../../../multilingual.type';

export class Question {
  constructor(
    public typeCode: string,
    public questionText: Multilingual,
    public formId: string,
    public interviewId: string,
    public op :Operation,
    public questionId?: string
  ) {}

  get operation(): Operation {
    return this.questionId ? Operation.UPDATE : Operation.CREATE;
  }
}