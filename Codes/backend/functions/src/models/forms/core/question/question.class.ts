import { Operation } from '../../../operation.enum';
import { Multilingual } from '../../../multilingual.type';

export class Question {
  constructor(
    public typeCode: 'OPEN_ENDED'|'SHORT_ANSWER'|'NUMBER'|'RATE'|'DROPDOWN'|'RADIO'|'MULTIPLE_CHOICE',
    public questionText: Multilingual,
    public formId: string,
    public interviewId: string,
    public questionId?: string
  ) {}

  get operation(): Operation {
    return this.questionId ? Operation.UPDATE : Operation.CREATE;
  }
}