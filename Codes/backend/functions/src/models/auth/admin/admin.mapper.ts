import { Operation } from '../../operation.enum';
import { BaseMapper } from '../../base-mapper';
import { Admin } from './admin.class';
import type { QueryResult } from 'pg';
import pool from '../../../utils/pool';
import { CurrentUser } from '../../../utils/currentUser.class';

export class AdminMapper extends BaseMapper<Admin> {
  async save(entity: Admin): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const op = entity.operation;
    const { adminId, name, qid, dateOfBirth, jobPosition } = entity;

    if (op === Operation.UPDATE) {
      await pool.query('CALL update_admin($1, $2, $3, $4, $5, $6)', [
        currentUserId,
        adminId,
        name,
        qid,
        dateOfBirth,
        jobPosition,
      ]);
    } else {
      console.log( currentUserId,
        adminId,
        name,
        qid,
        dateOfBirth,
        jobPosition,)
      await pool.query('CALL create_admin($1, $2, $3, $4, $5, $6)', [
        currentUserId,
        adminId,
        name,
        qid,
        dateOfBirth,
        jobPosition,
      ]);
    }
  }

  async getById(id: string): Promise<Admin | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_admin_by_id($1, $2)',
      [currentUserId, id]
    );
    let admin :Admin | undefined
     if(result.rows.length) {  admin =this.mapRowToEntity(result.rows[0]);
    admin.operation = Operation.UPDATE;}
    return admin ? admin : null;
  }

  async getAll(): Promise<Admin[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query('SELECT * FROM get_all_admins($1)', [
      currentUserId,
    ]);
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    await pool.query('CALL delete_admin($1, $2)', [currentUserId, id]);
  }

  private mapRowToEntity = (row: any): Admin => {
    return new Admin(
      row.qid,
      row.name,
      row.adminid,
      row.dateofbirth,
      row.jobposition
    );
  };
}
const adminMapper = new AdminMapper();
export default adminMapper;
