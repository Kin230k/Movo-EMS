import { Operation } from '../../../operation.enum';
import { BaseMapper } from '../../../base-mapper';
import { Submission } from './submission.class';
import type { QueryResult } from 'pg';
import pool from '../../../../utils/pool';

export class SubmissionMapper extends BaseMapper<Submission> {
  constructor() {
    super(pool);
  }

  async save(entity: Submission): Promise<void> {
    const op = entity.operation;
    const { submissionId, formId, userId, interviewId, dateSubmitted, outcome, decisionNotes } = entity;

    if (op === Operation.UPDATE) {
      if (!submissionId) throw new Error('Submission ID required for update');
      await this.pool.query(
        'CALL update_submission($1, $2, $3, $4, $5, $6, $7)',
        [submissionId, formId, userId, interviewId, dateSubmitted, outcome, decisionNotes]
      );
    } else {
      await this.pool.query(
        'CALL create_submission($1, $2, $3, $4, $5, $6)',
        [formId, userId, interviewId, dateSubmitted, outcome, decisionNotes]
      );
    }
  }

  async getById(id: string): Promise<Submission | null> {
    const result: QueryResult = await this.pool.query(
      'SELECT * FROM get_submission_by_id($1)',
      [id]
    );
    return result.rows.length ? new Submission(
      result.rows[0].formId,
      result.rows[0].userId,
      result.rows[0].interviewId,
      result.rows[0].dateSubmitted,
      result.rows[0].outcome,
      result.rows[0].decisionNotes,
      result.rows[0].submissionId
    ) : null;
  }

  async getAll(): Promise<Submission[]> {
    const result = await this.pool.query('SELECT * FROM get_all_submissions()');
    return result.rows.map(row => new Submission(
      row.formId,
      row.userId,
      row.interviewId,
      row.dateSubmitted,
      row.outcome,
      row.decisionNotes,
      row.submissionId
    ));
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('CALL delete_submission($1)', [id]);
  }
}

const submissionMapper = new SubmissionMapper();
export default submissionMapper;
