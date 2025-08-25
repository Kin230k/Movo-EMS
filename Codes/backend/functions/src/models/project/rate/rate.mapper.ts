import { Operation } from '../../operation.enum';
import { BaseMapper } from '../../base-mapper';
import { Rate } from './rate.class';
import type { QueryResult } from 'pg';
import pool from '../../../utils/pool';
import { CurrentUser } from '../../../utils/currentUser.class';

export class RateMapper extends BaseMapper<Rate> {
  async save(entity: Rate): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const op = entity.operation;
    const { rateId, hourlyRate, userId, projectId } = entity;

    // Validation
    if (hourlyRate == null) throw new Error('Hourly rate is required');
    if (!userId) throw new Error('User ID is required');
    if (!projectId) throw new Error('Project ID is required');

    if (op === Operation.UPDATE) {
      if (!rateId) throw new Error('Rate ID is required for update');
      await pool.query('CALL update_rate($1, $2, $3, $4, $5)', [
        currentUserId,
        rateId,
        hourlyRate,
        userId,
        projectId,
      ]);
    } else {
      await pool.query('CALL create_rate($1, $2, $3, $4)', [
        currentUserId,
        hourlyRate,
        userId,
        projectId,
      ]);
    }
  }

  async getById(id: string): Promise<Rate | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Rate ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_rate_by_id($1, $2)',
      [currentUserId, id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<Rate[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query('SELECT * FROM get_all_rates($1)', [
      currentUserId,
    ]);
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Rate ID is required');

    await pool.query('CALL delete_rate($1, $2)', [currentUserId, id]);
  }

  private mapRowToEntity = (row: any): Rate => {
    return new Rate(row.hourlyRate, row.userId, row.projectId, row.rateId);
  };
}

const rateMapper = new RateMapper();
export default rateMapper;
