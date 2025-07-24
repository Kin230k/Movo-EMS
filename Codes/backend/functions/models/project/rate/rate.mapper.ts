import { Operation } from "../../operation.enum";
import { BaseMapper } from "../../base-mapper";
import { Rate } from "./rate.class";
import type { Pool, QueryResult } from 'pg';

export class RateMapper extends BaseMapper<Rate> {
  constructor(pool: Pool) {
    super(pool);
  }

  async save(entity: Rate): Promise<void> {
    const op = entity.operation;
    const { rateId, hourlyRate, userId, projectId } = entity;

    if (op === Operation.UPDATE) {
      if (!entity.rateId) throw new Error('Rate ID is required for update');
      await this.pool.query(
        'CALL update_rate($1, $2, $3, $4)',
        [rateId, hourlyRate, userId, projectId]
      );
    } else {
      await this.pool.query(
        'CALL create_rate($1, $2, $3)',
        [hourlyRate, userId, projectId]
      );
    }
  }

  async getById(id: string): Promise<Rate | null> {
    const result: QueryResult = await this.pool.query(
      'SELECT * FROM get_rate_by_id($1)',
      [id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<Rate[]> {
    const result = await this.pool.query('SELECT * FROM get_all_rates()');
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('CALL delete_rate($1)', [id]);
  }

  private mapRowToEntity = (row: any): Rate => {
    return new Rate(
      row.hourlyRate,
      row.userId,
      row.projectId,
      row.rateId
    );
  };
}