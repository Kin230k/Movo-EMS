import { Operation } from '../../operation.enum';
import { BaseMapper } from '../../base-mapper';
import { Attendance } from './attendance.class';
import type { QueryResult } from 'pg';
import pool from '../../../utils/pool';

export class AttendanceMapper extends BaseMapper<Attendance> {
  async save(entity: Attendance): Promise<void> {
    const op = entity.operation;
    const { attendanceId, date, time, signedWith, signedBy, userId, areaId } =
      entity;

    if (op === Operation.UPDATE) {
      if (!entity.attendanceId)
        throw new Error('Attendance ID is required for update');
      await pool.query('CALL update_attendance($1, $2, $3, $4, $5, $6, $7)', [
        attendanceId,
        date,
        time,
        signedWith,
        signedBy,
        userId,
        areaId,
      ]);
    } else {
      await pool.query('CALL create_attendance($1, $2, $3, $4, $5, $6)', [
        date,
        time,
        signedWith,
        signedBy,
        userId,
        areaId,
      ]);
    }
  }

  async getById(id: string): Promise<Attendance | null> {
    const result: QueryResult = await pool.query(
      'SELECT * FROM get_attendance_by_id($1)',
      [id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<Attendance[]> {
    const result = await pool.query('SELECT * FROM get_all_attendances()');
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    await pool.query('CALL delete_attendance($1)', [id]);
  }

  private mapRowToEntity = (row: any): Attendance => {
    return new Attendance(
      row.date,
      row.time,
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
