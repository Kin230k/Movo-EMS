import submissionMapper from './submission.mapper';
import { Submission } from './submission.class';
import { SubmissionOutcome } from '../../../submission_outcome.enum';
import { Operation } from '../../../operation.enum';

export class SubmissionService {
  static async createSubmission(
    formId: string,
    userId: string,
    interviewId: string,
    dateSubmitted: Date,
    outcome?: SubmissionOutcome,
    decisionNotes?: string
  ): Promise<void> {
    const entity = new Submission(
      formId,
      userId,
      interviewId,
      dateSubmitted,
      Operation.CREATE,
      outcome,
      decisionNotes
    );
    await submissionMapper.save(entity);
  }

  static async updateSubmission(
    submissionId: string,
    formId: string,
    userId: string,
    interviewId: string,
    dateSubmitted: Date,
    outcome?: SubmissionOutcome,
    decisionNotes?: string
  ): Promise<void> {
    const entity = new Submission(
      formId,
      userId,
      interviewId,
      dateSubmitted,
      Operation.UPDATE,
      outcome,
      decisionNotes,
      submissionId
    );
    await submissionMapper.save(entity);
  }

  static async getSubmissionById(id: string): Promise<Submission | null> {
    return await submissionMapper.getById(id);
  }

  static async getAllSubmissions(): Promise<Submission[]> {
    return await submissionMapper.getAll();
  }

  static async deleteSubmission(id: string): Promise<void> {
    await submissionMapper.delete(id);
  }
}
