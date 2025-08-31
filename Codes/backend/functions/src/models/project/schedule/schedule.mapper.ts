import { Operation } from '../../operation.enum';
import { BaseMapper } from '../../base-mapper';
import { Schedule } from './schedule.class';
import type { QueryResult } from 'pg';
import pool from '../../../utils/pool';
import { CurrentUser } from '../../../utils/currentUser.class';

export class ScheduleMapper extends BaseMapper<Schedule> {
  async save(entity: Schedule): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const op = entity.operation;
    const { scheduleId, createdAt, startTime, endTime, projectId, locationId } =
      entity;

    // Validation
    if (op === Operation.CREATE) {
      if (!createdAt) throw new Error('Creation date is required');
    }
    if (!startTime) throw new Error('Start time is required');
    if (!endTime) throw new Error('End time is required');

    if (op === Operation.UPDATE) {
      if (!scheduleId) throw new Error('Schedule ID is required for update');
      await pool.query('CALL update_schedule($1, $2, $3, $4, $5, $6)', [
        currentUserId,
        scheduleId,
        startTime,
        endTime,
        projectId,
        locationId,
      ]);
    } else {
      await pool.query('CALL create_schedule($1, $2, $3, $4, $5, $6)', [
        currentUserId,
        createdAt,
        startTime,
        endTime,
        projectId,
        locationId,
      ]);
    }
  }

  async getById(id: string): Promise<Schedule | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Schedule ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_schedule_by_id($1, $2)',
      [currentUserId, id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<Schedule[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query('SELECT * FROM get_all_schedules($1)', [
      currentUserId,
    ]);
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Schedule ID is required');

    await pool.query('CALL delete_schedule($1, $2)', [currentUserId, id]);
  }

  async getByLocation(locationId: string): Promise<Schedule[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!locationId) throw new Error('Location ID is required');

    const result = await pool.query(
      'SELECT * FROM get_schedule_by_location($1, $2)',
      [currentUserId, locationId]
    );
    return result.rows.map(this.mapRowToEntity);
  }

  async getByProjectOrLocation(
    projectId?: string,
    locationId?: string
  ): Promise<Schedule[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!projectId && !locationId)
      throw new Error('Either project ID or location ID is required');

    const result = await pool.query(
      'SELECT * FROM get_schedules_by_project_or_location($1, $2, $3)',
      [currentUserId, projectId || null, locationId || null]
    );
    return result.rows.map(this.mapRowToEntity);
  }

  private mapRowToEntity = (row: any): Schedule => {
    return new Schedule(
      row.starttime,
      row.endtime,
      row.projectid,
      row.locationid,
      row.createdat,
      row.scheduleid
    );
  };
}

const scheduleMapper = new ScheduleMapper();
export default scheduleMapper;
