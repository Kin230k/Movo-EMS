import { Operation } from '../../operation.enum';
import { BaseMapper } from '../../base-mapper';
import { Attendance } from './attendance.class';
import type { QueryResult } from 'pg';
import pool from '../../../utils/pool';
import { CurrentUser } from '../../../utils/currentUser.class';
import { Multilingual } from '../../multilingual.type';

export enum enAttendanceStatus {
  present = 'present',
  absent = 'absent',
}

export interface UserAttendance {
  userId?: string;
  name: Multilingual;
  role: string;
  userStatus: string;
  picture: string | undefined;
  attendanceTimestamp: string;
  attendanceStatus: enAttendanceStatus;
  attendanceId: string;
}
export class AttendanceMapper extends BaseMapper<Attendance> {
  async save(entity: Attendance): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const op = entity.operation;
    const {
      attendanceId,
      attendanceTimestamp,
      signedWith,
      signedBy,
      userId,
      areaId,
    } = entity;

    if (!attendanceTimestamp)
      throw new Error('Attendance timestamp is required');
    if (!signedWith) throw new Error('SignedWith is required');
    if (!userId) throw new Error('User ID is required');
    if (!areaId) throw new Error('Area ID is required');

    if (op === Operation.UPDATE) {
      if (!attendanceId)
        throw new Error('Attendance ID is required for update');
      await pool.query('CALL update_attendance($1, $2, $3, $4, $5, $6, $7)', [
        currentUserId,
        attendanceId,
        attendanceTimestamp,
        signedWith,
        signedBy,
        userId,
        areaId,
      ]);
    } else {
      await pool.query('CALL create_attendance($1, $2, $3, $4, $5, $6)', [
        currentUserId,
        attendanceTimestamp,
        signedWith,
        signedBy,
        userId,
        areaId,
      ]);
    }
  }

  async getById(id: string): Promise<Attendance | null> {
    if (!id) throw new Error('Attendance ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_attendance_by_id($1)',
      [id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<Attendance[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query('SELECT * FROM get_all_attendances($1)', [
      currentUserId,
    ]);
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
  async getUserAttendancesByProject(
    projectId: string
  ): Promise<UserAttendance[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!projectId) throw new Error('Project ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_user_attendances_by_project($1, $2)',
      [currentUserId, projectId]
    );

    return result.rows.map(this.mapRowToUserAttendance);
  }

  private mapRowToEntity = (row: any): Attendance => {
    const attendanceTimeStamp =
      row.attendancetimestamp instanceof Date
        ? row.attendancetimestamp.toISOString()
        : row.attendancetimestamp !== null &&
          row.attendancetimestamp !== undefined
        ? String(row.attendancetimestamp)
        : null;

    return new Attendance(
      attendanceTimeStamp as string,
      row.signedwith,
      row.signedby,
      row.userid,
      row.areaid,
      row.attendanceid
    );
  };
  private mapRowToUserAttendance = (row: any): UserAttendance => {
    const attendanceTimeStamp =
      row.attendancetimestamp instanceof Date
        ? row.attendancetimestamp.toISOString()
        : row.attendancetimestamp !== null &&
          row.attendancetimestamp !== undefined
        ? String(row.attendancetimestamp)
        : null;
    console.log(row);

    return {
      userId: row.userid,
      name: row.name,
      role: row.role,
      userStatus: row.userstatus,
      picture: row.picture,
      attendanceTimestamp: attendanceTimeStamp as string,
      attendanceStatus: row.attendancestatus as enAttendanceStatus,
      attendanceId: row.attendanceid,
    };
  };
}

const attendanceMapper = new AttendanceMapper();
export default attendanceMapper;
