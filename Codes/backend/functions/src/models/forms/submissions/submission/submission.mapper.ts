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
      if (!userId) throw new Error('User ID is required');

      // CREATE: call the DB function that RETURNS TABLE(...) and read the returned row

      const result: QueryResult = await pool.query(
        `SELECT * FROM create_submission($1, $2, $3, $4, $5, $6)`,
        [
          currentUserId,
          formId,
          userId,
          interviewId,
          dateSubmitted,
          decisionNotes,
        ]
      );

      const created = result.rows?.[0];
      if (!created) {
        throw new Error(
          'Failed to create submission: create_submission returned no rows'
        );
      }

      // normalize possible column name casing and attach to entity
      const createdId =
        created.submissionId ?? created.submissionid ?? created.submission_id;
      if (!createdId) {
        throw new Error('create_submission returned row without submissionId');
      }

      entity.submissionId = createdId;
      entity.formId =
        created.formId ?? created.formid ?? created.form_id ?? entity.formId;
      entity.userId =
        created.userId ?? created.userid ?? created.user_id ?? entity.userId;
      entity.interviewId =
        created.interviewId ??
        created.interviewid ??
        created.interview_id ??
        entity.interviewId;
      entity.dateSubmitted =
        created.dateSubmitted ??
        created.datesubmitted ??
        created.date_submitted ??
        entity.dateSubmitted;
      entity.outcome = created.outcome ?? entity.outcome;
      entity.decisionNotes =
        created.decisionNotes ??
        created.decisionnotes ??
        created.decision_notes ??
        entity.decisionNotes;
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
  async getManualByFormId(formId: string): Promise<Submission[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!formId) throw new Error('Form ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_manual_submission_by_form_id($1, $2)',
      [currentUserId, formId]
    );

    return result.rows.map(this.mapRowToSubmission);
  }
  async getSubmissionsByFormId(formId: string): Promise<Submission[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!formId) throw new Error('Form ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_submissions_by_form_id($1, $2)',
      [currentUserId, formId]
    );

    return result.rows.map(this.mapRowToSubmission);
  }
  async updateSubmissionStatus(
    submissionId: string,
    outcome: string,
    decisionNotes?: string
  ): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!submissionId) throw new Error('Submission ID is required');
    if (!outcome) throw new Error('Outcome is required');

    await pool.query('CALL update_submission_status($1, $2, $3,$4)', [
      currentUserId,
      submissionId,
      outcome,
      decisionNotes,
    ]);
  }

  private mapRowToSubmission = (row: any): Submission => {
    const rawDateSubmitted =
      row.dateSubmitted ?? row.datesubmitted ?? row.date_submitted;
    const dateSubmitted =
      rawDateSubmitted instanceof Date
        ? rawDateSubmitted.toISOString()
        : rawDateSubmitted !== null && rawDateSubmitted !== undefined
        ? String(rawDateSubmitted)
        : null;

    return new Submission(
      row.formId ?? row.formid ?? row.form_id,
      row.userId ?? row.userid ?? row.user_id,
      row.interviewId ?? row.interviewid ?? row.interview_id,
      dateSubmitted as string,
      // returned objects are update-ready

      row.decisionNotes ?? row.decisionnotes ?? row.decision_notes,
      row.outcome ?? row.outcome,
      row.submissionId ?? row.submissionid ?? row.submission_id
    );
  };
}

const submissionMapper = new SubmissionMapper();
export default submissionMapper;
