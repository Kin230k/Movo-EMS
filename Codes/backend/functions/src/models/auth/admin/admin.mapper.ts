import { Operation } from '../../operation.enum';
import { BaseMapper } from '../../base-mapper';
import { Admin } from './admin.class';
import type { QueryResult } from 'pg';
import pool from '../../../utils/pool';

export class AdminMapper extends BaseMapper<Admin> {
  async save(entity: Admin): Promise<void> {
    const op = entity.operation;
    const { adminId, name, qid, dateOfBirth, jobPosition } = entity;

    if (op === Operation.UPDATE) {
      await pool.query('CALL update_admin($1, $2, $3, $4, $5)', [
        adminId,
        name,
        qid,
        dateOfBirth,
        jobPosition,
      ]);
    } else {
      await pool.query('CALL create_admin($1, $2, $3, $4)', [
        name,
        qid,
        dateOfBirth,
        jobPosition,
      ]);
    }
  }

  async getById(id: string): Promise<Admin | null> {
    const result: QueryResult = await pool.query(
      'SELECT * FROM get_admin_by_id($1)',
      [id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<Admin[]> {
    const result = await pool.query('SELECT * FROM get_all_admins()');
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    await pool.query('CALL delete_admin($1)', [id]);
  }

  private mapRowToEntity = (row: any): Admin => {
    return new Admin(
      row.qid,
      row.name,
      row.adminId,
      row.dateOfBirth,
      row.jobPosition
    );
  };

}
const adminMapper = new AdminMapper();
export default adminMapper;
