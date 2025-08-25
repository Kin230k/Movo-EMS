import { Operation } from '../../../operation.enum';

export class RuleCriterion {
  constructor(
    public ruleId: string,
    public criterionId: string,
    public required: boolean,
    public op:Operation,
    public ruleCriterionId?: string
  ) {}

  get operation(): Operation {
    return this.ruleCriterionId ? Operation.UPDATE : Operation.CREATE;
  }
}