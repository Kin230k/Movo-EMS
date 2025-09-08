import { Operation } from '../../../operation.enum';
import { Multilingual } from '../../../multilingual.type';

export class QuestionType {
  constructor(
    public description: Multilingual,
    public op :Operation,
    public typeCode?: string
  ) {}

  get operation(): Operation {
    return this.typeCode ? Operation.UPDATE : Operation.CREATE;
  }
}