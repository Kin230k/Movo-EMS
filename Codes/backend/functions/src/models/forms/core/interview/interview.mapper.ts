import { Operation } from '../../../operation.enum';
import { BaseMapper } from '../../../base-mapper';
import { Interview } from './interview.class';
import type { QueryResult } from 'pg';
import pool from '../../../../utils/pool';
import { CurrentUser } from '../../../../utils/currentUser.class';

export class InterviewMapper extends BaseMapper<Interview> {
  async save(entity: Interview): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const op = entity.operation;
    const { interviewId, projectId } = entity;

    if (!projectId) throw new Error('Project ID is required');

    if (op === Operation.UPDATE) {
      if (!interviewId) throw new Error('Interview ID is required for update');
      await pool.query('CALL update_interview($1, $2, $3)', [
        currentUserId,
        interviewId,
        projectId,
      ]);
    } else {
      await pool.query('CALL create_interview($1, $2)', [
        currentUserId,
        projectId,
      ]);
    }
  }

  async getById(id: string): Promise<Interview | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Interview ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_interview_by_id($1, $2)',
      [currentUserId, id]
    );
    return result.rows.length ? this.mapRowToInterview(result.rows[0]) : null;
  }

  async getAll(): Promise<Interview[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query('SELECT * FROM get_all_interviews($1)', [
      currentUserId,
    ]);
    return result.rows.map(this.mapRowToInterview);
  }

  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Interview ID is required');

    await pool.query('CALL delete_interview($1, $2)', [currentUserId, id]);
  }

  private mapRowToInterview = (row: any): Interview => {
    return new Interview(row.projectId, row.interviewId);
  };
}

const interviewMapper = new InterviewMapper();
export default interviewMapper;
