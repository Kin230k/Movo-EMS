import { Operation } from "../../operation.enum";
import { BaseMapper } from "../../base-mapper";
import { Schedule } from "./schedule.class";
import type { Pool, QueryResult } from 'pg';

export class ScheduleMapper extends BaseMapper<Schedule> {
  constructor(pool: Pool) {
    super(pool);
  }

  async save(entity: Schedule): Promise<void> {
    const op = entity.operation;
    const { scheduleId, createdAt, startTime, endTime, projectId, locationId } = entity;

    if (op === Operation.UPDATE) {
      if (!entity.scheduleId) throw new Error('Schedule ID is required for update');
      await this.pool.query(
        'CALL update_schedule($1, $2, $3, $4, $5, $6)',
        [scheduleId, createdAt, startTime, endTime, projectId, locationId]
      );
    } else {
      await this.pool.query(
        'CALL create_schedule($1, $2, $3, $4, $5)',
        [createdAt, startTime, endTime, projectId, locationId]
      );
    }
  }

  async getById(id: string): Promise<Schedule | null> {
    const result: QueryResult = await this.pool.query(
      'SELECT * FROM get_schedule_by_id($1)',
      [id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<Schedule[]> {
    const result = await this.pool.query('SELECT * FROM get_all_schedules()');
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('CALL delete_schedule($1)', [id]);
  }

  private mapRowToEntity = (row: any): Schedule => {
    return new Schedule(
      row.createdAt,
      row.startTime,
      row.endTime,
      row.projectId,
      row.locationId,
      row.scheduleId
    );
  };
}