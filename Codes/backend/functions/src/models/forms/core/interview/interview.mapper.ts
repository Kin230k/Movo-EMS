import { Operation } from '../../../operation.enum';
import { BaseMapper } from '../../../base-mapper';
import { Interview } from './interview.class';
import type { QueryResult } from 'pg';
import pool from '../../../../utils/pool';

export class InterviewMapper extends BaseMapper<Interview> {
  async save(entity: Interview): Promise<void> {
    const op = entity.operation;
    const { interviewId, projectId } = entity;

    if (op === Operation.UPDATE) {
      if (!interviewId) throw new Error('Interview ID required for update');
      await pool.query('CALL update_interview($1, $2)', [
        interviewId,
        projectId,
      ]);
    } else {
      await pool.query('CALL create_interview($1)', [projectId]);
    }
  }

  async getById(id: string): Promise<Interview | null> {
    const result: QueryResult = await pool.query(
      'SELECT * FROM get_interview_by_id($1)',
      [id]
    );
    return result.rows.length
      ? new Interview(result.rows[0].projectId, result.rows[0].interviewId)
      : null;
  }

  async getAll(): Promise<Interview[]> {
    const result = await pool.query('SELECT * FROM get_all_interviews()');
    return result.rows.map(
      (row) => new Interview(row.projectId, row.interviewId)
    );
  }

  async delete(id: string): Promise<void> {
    await pool.query('CALL delete_interview($1)', [id]);
  }
}

const interviewMapper = new InterviewMapper();
export default interviewMapper;
