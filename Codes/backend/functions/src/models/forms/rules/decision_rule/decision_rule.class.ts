import { Operation } from '../../../operation.enum';
import { Multilingual } from '../../../multilingual.type';
import { SubmissionOutcome } from '../../../submission_outcome.enum';

export class DecisionRule {
  constructor(
    public name: Multilingual,
    public priority: number,
    public formId: string,
    public op :Operation,
    public outcomeOnPass?: SubmissionOutcome,
    public outcomeOnFail?: SubmissionOutcome,
    public description?: Multilingual,
    public ruleId?: string
  ) {}

  get operation(): Operation {
    return this.ruleId ? Operation.UPDATE : Operation.CREATE;
  }
}