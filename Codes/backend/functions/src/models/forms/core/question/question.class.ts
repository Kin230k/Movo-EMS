import { Operation } from '../../../operation.enum';

export class Question {
  constructor(
    public typeCode:
      | 'OPEN_ENDED'
      | 'SHORT_ANSWER'
      | 'NUMBER'
      | 'RATE'
      | 'DROPDOWN'
      | 'RADIO'
      | 'MULTIPLE_CHOICE',
    public questionText: string, // Changed from Multilingual to string
    public formId: string | null,
    public interviewId: string | null,
    public questionId?: string
  ) {}

  get operation(): Operation {
    return this.questionId ? Operation.UPDATE : Operation.CREATE;
  }
}
