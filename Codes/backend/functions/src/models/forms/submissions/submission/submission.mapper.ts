import { Operation } from '../../../operation.enum';
import { BaseMapper } from '../../../base-mapper';
import { Submission } from './submission.class';
import type { QueryResult } from 'pg';
import pool from '../../../../utils/pool';
import { CurrentUser } from '../../../../utils/currentUser.class';

export class SubmissionMapper extends BaseMapper<Submission> {
  async save(entity: Submission): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const op = entity.operation;
    const {
      submissionId,
      formId,
      userId,
      interviewId,
      dateSubmitted,
      outcome,
      decisionNotes,
    } = entity;

    if (!formId) throw new Error('Form ID is required');
    if (!userId) throw new Error('User ID is required');
    if (!interviewId) throw new Error('Interview ID is required');
    if (!dateSubmitted) throw new Error('Date Submitted is required');

    if (op === Operation.UPDATE) {
      if (!submissionId)
        throw new Error('Submission ID is required for update');
      await pool.query(
        'CALL update_submission($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          currentUserId,
          submissionId,
          formId,
          userId,
          interviewId,
          dateSubmitted,
          outcome,
          decisionNotes,
        ]
      );
    } else {
      await pool.query('CALL create_submission($1, $2, $3, $4, $5, $6, $7)', [
        currentUserId,
        formId,
        userId,
        interviewId,
        dateSubmitted,
        outcome,
        decisionNotes,
      ]);
    }
  }

  async getById(id: string): Promise<Submission | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Submission ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_submission_by_id($1, $2)',
      [currentUserId, id]
    );
    return result.rows.length ? this.mapRowToSubmission(result.rows[0]) : null;
  }

  async getAll(): Promise<Submission[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query('SELECT * FROM get_all_submissions($1)', [
      currentUserId,
    ]);
    return result.rows.map(this.mapRowToSubmission);
  }

  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Submission ID is required');

    await pool.query('CALL delete_submission($1, $2)', [currentUserId, id]);
  }

  private mapRowToSubmission = (row: any): Submission => {
    return new Submission(
      row.formId,
      row.userId,
      row.interviewId,
      row.dateSubmitted,
      row.outcome,
      row.decisionNotes,
      row.submissionId
    );
  };
}

const submissionMapper = new SubmissionMapper();
export default submissionMapper;
