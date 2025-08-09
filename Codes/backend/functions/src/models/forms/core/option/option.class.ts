import { Operation } from '../../../operation.enum';
import { Multilingual } from '../../../multilingual.type';

export class Option {
  constructor(
    public optionText: Multilingual,
    public questionId: string,
    public isCorrect: boolean,
    public displayOrder: number,
    public op :Operation,
    public optionId?: string
  ) {}

  get operation(): Operation {
    return this.optionId ? Operation.UPDATE : Operation.CREATE;
  }
}