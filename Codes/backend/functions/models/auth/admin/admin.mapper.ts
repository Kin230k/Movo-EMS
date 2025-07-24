import { Operation } from "../../operation.enum";
import { BaseMapper } from "../../base-mapper";
import { Admin } from "./admin.class";
import type { Pool, QueryResult } from 'pg';

export class AdminMapper extends BaseMapper<Admin> {
  constructor(pool: Pool) {
    super(pool);
  }

  async save(entity: Admin): Promise<void> {
    const op = entity.operation;
    const { adminId, firstName, lastName, qid, dateOfBirth, jobPosition } = entity;

    if (op === Operation.UPDATE) {
      if (!entity.adminId) throw new Error('Admin ID is required for update');
      await this.pool.query(
        'CALL update_admin($1, $2, $3, $4, $5, $6)',
        [adminId, firstName, lastName, qid, dateOfBirth, jobPosition]
      );
    } else {
      await this.pool.query(
        'CALL create_admin($1, $2, $3, $4, $5)',
        [firstName, lastName, qid, dateOfBirth, jobPosition]
      );
    }
  }

  async getById(id: string): Promise<Admin | null> {
    const result: QueryResult = await this.pool.query(
      'SELECT * FROM get_admin_by_id($1)',
      [id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<Admin[]> {
    const result = await this.pool.query('SELECT * FROM get_all_admins()');
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('CALL delete_admin($1)', [id]);
  }

  private mapRowToEntity = (row: any): Admin => {
    return new Admin(
      row.qid,
      row.adminId,
      row.firstName,
      row.lastName,
      row.dateOfBirth,
      row.jobPosition
    );
  };
}