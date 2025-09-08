import { Operation } from '../../../operation.enum';

export class Option {
  constructor(
    public optionText: string,  // Changed from Multilingual to string
    public questionId: string,
    public isCorrect: boolean,
    public displayOrder: number,
    public optionId?: string
  ) {}

  get operation(): Operation {
    return this.optionId ? Operation.UPDATE : Operation.CREATE;
  }
}