import { Operation } from '../../../operation.enum';

export class CriteriaResult {
  constructor(
    public answerId: string,
    public criterionId: string,
    public passed: boolean,
    public evaluatedAt: Date,
    public op:Operation,
    public criterionResultId?: string
  ) {}

  get operation(): Operation {
    return this.criterionResultId ? Operation.UPDATE : Operation.CREATE;
  }
}