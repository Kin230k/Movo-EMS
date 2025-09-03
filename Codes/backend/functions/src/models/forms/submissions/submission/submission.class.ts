import { Operation } from '../../../operation.enum';
import { SubmissionOutcome } from '../../../submission_outcome.enum';

export class Submission {
  constructor(
    public formId: string,
    public userId: string,
    public interviewId: string | undefined,
    public dateSubmitted: string,
    public decisionNotes?: string,
     public outcome?: SubmissionOutcome,
    public submissionId?: string,
   
  ) {}

  get operation(): Operation {
    return this.submissionId ? Operation.UPDATE : Operation.CREATE;
  }
}