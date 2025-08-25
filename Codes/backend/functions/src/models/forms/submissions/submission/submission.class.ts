import { Operation } from '../../../operation.enum';
import { SubmissionOutcome } from '../../../submission_outcome.enum';

export class Submission {
  constructor(
    public formId: string,
    public userId: string,
    public interviewId: string,
    public dateSubmitted: Date,
    public op:Operation,
    public outcome?: SubmissionOutcome,
    public decisionNotes?: string,
    public submissionId?: string
  ) {}

  get operation(): Operation {
    return this.submissionId ? Operation.UPDATE : Operation.CREATE;
  }
}