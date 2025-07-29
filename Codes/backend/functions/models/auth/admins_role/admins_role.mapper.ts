import { Operation } from "../../operation.enum";
import { BaseMapper } from "../../base-mapper";
import { AdminsRole } from "./admins_role.class";
import type { Pool, QueryResult } from 'pg';

export class AdminsRoleMapper extends BaseMapper<AdminsRole> {
  constructor(pool: Pool) {
    super(pool);
  }

  async save(entity: AdminsRole): Promise<void> {
    const op = entity.operation;
    const { adminRoleId, adminId, roleId } = entity;

    if (op === Operation.UPDATE) {
      if (!entity.adminRoleId) throw new Error('AdminsRole ID is required for update');
      await this.pool.query(
        'CALL update_admins_role($1, $2, $3)',
        [adminRoleId, adminId, roleId]
      );
    } else {
      await this.pool.query(
        'CALL create_admins_role($1, $2)',
        [adminId, roleId]
      );
    }
  }

  async getById(id: string): Promise<AdminsRole | null> {
    const result: QueryResult = await this.pool.query(
      'SELECT * FROM get_admins_role_by_id($1)',
      [id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<AdminsRole[]> {
    const result = await this.pool.query('SELECT * FROM get_all_admins_roles()');
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('CALL delete_admins_role($1)', [id]);
  }

  private mapRowToEntity = (row: any): AdminsRole => {
    return new AdminsRole(
      row.adminId,
      row.roleId,
      row.adminRoleId
    );
  };
}