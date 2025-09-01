import submissionMapper from './submission.mapper';
import { Submission } from './submission.class';
import { SubmissionOutcome } from '../../../submission_outcome.enum';

export class SubmissionService {
  static async createSubmission(
    formId: string,
    userId: string,
    interviewId: string | undefined,
    dateSubmitted: Date,
    decisionNotes?: string,
    outcome?: string
  ): Promise<string> {
    // <- now returns the generated submissionId
    const entity = new Submission(
      formId,
      userId,
      interviewId,
      dateSubmitted,
      decisionNotes,
      outcome as SubmissionOutcome
    );

    await submissionMapper.save(entity);

    const createdId = entity.submissionId;
    if (!createdId) {
      throw new Error(
        'Failed to create submission: no id returned from mapper/DB'
      );
    }
    return createdId;
  }

  static async updateSubmission(
    submissionId: string,
    formId: string,
    userId: string,
    interviewId: string,
    dateSubmitted?: Date|null,
    outcome?: SubmissionOutcome,
    decisionNotes?: string
  ): Promise<void> {
    const entity = new Submission(
      formId,
      userId,
      interviewId,
      dateSubmitted!,
      decisionNotes,
      outcome,
      submissionId
    );
    await submissionMapper.save(entity);
  }

  static async getSubmissionById(id: string): Promise<Submission | null> {
    return await submissionMapper.getById(id);
  }
  static async getManualSubmissionsByFormId(
    formId: string
  ): Promise<Submission[]> {
    return await submissionMapper.getManualByFormId(formId);
  }

  static async getAllSubmissions(): Promise<Submission[]> {
    return await submissionMapper.getAll();
  }
  static async updateSubmissionStatus(
    submissionId: string,
    outcome: string,
    decisionNotes?: string
  ): Promise<void> {
    await submissionMapper.updateSubmissionStatus(
      submissionId,
      outcome,
      decisionNotes
    );
  }

  static async getSubmissionsByForm(formId: string): Promise<Submission[]> {
    return await submissionMapper.getSubmissionsByFormId(formId);
  }

  static async deleteSubmission(id: string): Promise<void> {
    await submissionMapper.delete(id);
  }
}
