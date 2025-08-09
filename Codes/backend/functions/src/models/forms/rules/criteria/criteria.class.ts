import { Operation } from '../../../operation.enum';

export class Criteria {
  constructor(
    public type: any,
    public questionId: string,
    public op :Operation,
    public criterionId?: string,
    public value?: string
  ) {}

  get operation(): Operation {
    return this.criterionId ? Operation.UPDATE : Operation.CREATE;
  }
}
