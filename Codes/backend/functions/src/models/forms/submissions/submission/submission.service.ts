import submissionMapper from './submission.mapper';
import { Submission } from './submission.class';
import { SubmissionOutcome } from '../../../submission_outcome.enum';


export class SubmissionService {
  static async createSubmission(
    formId: string,
    userId: string,
    interviewId: string |undefined,
    dateSubmitted: Date,
    decisionNotes?: string
  ): Promise<string> {
    // <- now returns the generated submissionId
    const entity = new Submission(
      formId,
      userId,
      interviewId,
      dateSubmitted,
      decisionNotes
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
    dateSubmitted: Date,
    outcome?: SubmissionOutcome,
    decisionNotes?: string
  ): Promise<void> {
    const entity = new Submission(
      formId,
      userId,
      interviewId,
      dateSubmitted,
      decisionNotes,
      outcome,
      submissionId
    );
    await submissionMapper.save(entity);
  }

  static async getSubmissionById(id: string): Promise<Submission | null> {
    return await submissionMapper.getById(id);
  }
    static async getManualSubmissionsByFormId(formId: string): Promise<Submission[]> {
    return await submissionMapper.getManualByFormId(formId);
  }


  static async getAllSubmissions(): Promise<Submission[]> {
    return await submissionMapper.getAll();
  }
  static async updateSubmissionStatusForManual(
  submissionId: string,
  outcome: string
): Promise<void> {
  await submissionMapper.updateSubmissionStatusForManual(submissionId, outcome);
}
static async getSubmissionsByForm(formId:string): Promise<Submission[]> {
    return await submissionMapper.getSubmissionsByFormId(formId);
  }


  static async deleteSubmission(id: string): Promise<void> {
    await submissionMapper.delete(id);
  }
}
