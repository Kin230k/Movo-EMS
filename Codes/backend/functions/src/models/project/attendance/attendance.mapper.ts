import { Operation } from '../../operation.enum';
import { BaseMapper } from '../../base-mapper';
import { Attendance } from './attendance.class';
import type { QueryResult } from 'pg';
import pool from '../../../utils/pool';
import { CurrentUser } from '../../../utils/currentUser.class';

export class AttendanceMapper extends BaseMapper<Attendance> {
  async save(entity: Attendance): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const op = entity.operation;
    const { attendanceId, attendanceTimestamp, signedWith, signedBy, userId, areaId } = entity;

    if (!attendanceTimestamp) throw new Error('Attendance timestamp is required');
    if (!signedWith) throw new Error('SignedWith is required');
    if (!userId) throw new Error('User ID is required');
    if (!areaId) throw new Error('Area ID is required');

    if (op === Operation.UPDATE) {
      if (!attendanceId) throw new Error('Attendance ID is required for update');
      await pool.query(
        'CALL update_attendance($1, $2, $3, $4, $5, $6, $7)',
        [currentUserId, attendanceId, attendanceTimestamp, signedWith, signedBy, userId, areaId]
      );
    } else {
      await pool.query(
        'CALL create_attendance($1, $2, $3, $4, $5, $6)',
        [currentUserId, attendanceTimestamp, signedWith, signedBy, userId, areaId]
      );
    }
  }

  async getById(id: string): Promise<Attendance | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Attendance ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_attendance_by_id($1, $2)',
      [currentUserId, id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<Attendance[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query('SELECT * FROM get_all_attendances($1)', [currentUserId]);
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Attendance ID is required');

    await pool.query('CALL delete_attendance($1, $2)', [currentUserId, id]);
  }
  async getByUser(userId: string): Promise<Attendance[]> {
  const currentUserId = CurrentUser.uuid;
  if (!currentUserId) throw new Error('Current user UUID is not set');
  if (!userId) throw new Error('User ID is required');
  
  

  const result: QueryResult = await pool.query(
    'SELECT * FROM get_attendance_by_user($1, $2)',
    [currentUserId, userId]
  );


  return result.rows.map(this.mapRowToEntity);
}
// Add to attendance.mapper.ts
async getByProject(projectId: string): Promise<Attendance[]> {
  const currentUserId = CurrentUser.uuid;
  if (!currentUserId) throw new Error('Current user UUID is not set');
  if (!projectId) throw new Error('Project ID is required');

  const result: QueryResult = await pool.query(
    'SELECT * FROM get_attendances_by_project($1, $2)',
    [currentUserId, projectId]
  );

  return result.rows.map(this.mapRowToEntity);
}

  private mapRowToEntity = (row: any): Attendance => {
    return new Attendance(
      row.attendanceTimestamp,
      row.signedWith,
      row.signedBy,
      row.userId,
      row.areaId,
      row.attendanceId
    );
  };
}

const attendanceMapper = new AttendanceMapper();
export default attendanceMapper;
